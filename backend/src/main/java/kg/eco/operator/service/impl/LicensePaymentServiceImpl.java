package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.LicenseMapper;
import kg.eco.operator.dto.request.ManualPaymentRequest;
import kg.eco.operator.dto.response.PaymentIntentResponse;
import kg.eco.operator.dto.response.PaymentStatusResponse;
import kg.eco.operator.entity.LicenseApplication;
import kg.eco.operator.entity.LicensePayment;
import kg.eco.operator.entity.LicensePaymentEvent;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.LicenseApplicationStatus;
import kg.eco.operator.entity.enums.LicensePaymentMethod;
import kg.eco.operator.entity.enums.LicensePaymentStatus;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.exception.UnauthorizedException;
import kg.eco.operator.repository.LicenseApplicationRepository;
import kg.eco.operator.repository.LicensePaymentEventRepository;
import kg.eco.operator.repository.LicensePaymentRepository;
import kg.eco.operator.repository.SystemSettingRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.FileStorageService;
import kg.eco.operator.service.LicensePaymentService;
import kg.eco.operator.service.payment.PaymentIntent;
import kg.eco.operator.service.payment.PaymentProvider;
import kg.eco.operator.service.payment.PaymentProviderFactory;
import kg.eco.operator.service.payment.WebhookEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Реализация сервиса оплаты госпошлины за лицензию.
 * Поддерживает два режима: онлайн (через PaymentProvider) и офлайн
 * (загрузка квитанции + ручное подтверждение сотрудником).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LicensePaymentServiceImpl implements LicensePaymentService {

    private static final String MINIO_FOLDER = "licenses/receipts";
    private static final long MAX_RECEIPT_SIZE = 10L * 1024 * 1024;
    private static final String FEE_SETTING = "license_fee_kgs";
    private static final BigDecimal DEFAULT_FEE = new BigDecimal("1000");
    private static final String TIMEOUT_SETTING = "license_payment_pending_timeout_hours";
    private static final int DEFAULT_TIMEOUT_HOURS = 24;

    private final LicensePaymentRepository paymentRepository;
    private final LicensePaymentEventRepository eventRepository;
    private final LicenseApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final FileStorageService fileStorageService;
    private final PaymentProviderFactory providerFactory;
    private final LicenseMapper mapper;

    @Override
    @Transactional
    public PaymentIntentResponse createOnlineIntent(Long applicationId, String userInn, String returnUrl) {
        User user = loadUser(userInn);
        LicenseApplication app = loadApp(applicationId);
        ensureOwnership(app, user);

        if (app.getStatus() != LicenseApplicationStatus.PAYMENT_PENDING
                && app.getStatus() != LicenseApplicationStatus.DRAFT) {
            throw new BusinessLogicException(
                    "Оплата возможна только на статусе DRAFT или PAYMENT_PENDING. Текущий: "
                            + app.getStatus().getValue());
        }

        // Уже есть активный платёж — вернём существующий intent (идемпотентность).
        Optional<LicensePayment> existing = paymentRepository.findActiveByApplicationId(applicationId);
        if (existing.isPresent() && existing.get().getStatus() == LicensePaymentStatus.PENDING) {
            LicensePayment p = existing.get();
            return PaymentIntentResponse.builder()
                    .paymentId(p.getId())
                    .provider(p.getProvider())
                    .providerOrderId(p.getProviderOrderId())
                    .paymentUrl(buildReturnPaymentUrl(p))
                    .expiresAt(p.getExpiresAt())
                    .build();
        }

        BigDecimal amount = readAmountFromSettings();
        PaymentProvider provider = providerFactory.getActive();
        PaymentIntent intent = provider.createIntent(app, amount, returnUrl);

        LicensePayment p = new LicensePayment();
        p.setApplication(app);
        p.setProvider(provider.code());
        p.setProviderOrderId(intent.getProviderOrderId());
        p.setAmount(amount);
        p.setCurrency("KGS");
        p.setStatus(LicensePaymentStatus.PENDING);
        p.setExpiresAt(intent.getExpiresAt());
        paymentRepository.save(p);

        // Если заявка ещё в DRAFT — двигаем её в PAYMENT_PENDING.
        if (app.getStatus() == LicenseApplicationStatus.DRAFT) {
            app.setStatus(LicenseApplicationStatus.PAYMENT_PENDING);
            applicationRepository.save(app);
        }

        log.info("Online payment intent created: paymentId={}, provider={}, orderId={}, applicationId={}",
                p.getId(), provider.code(), intent.getProviderOrderId(), applicationId);

        return PaymentIntentResponse.builder()
                .paymentId(p.getId())
                .provider(provider.code())
                .providerOrderId(intent.getProviderOrderId())
                .paymentUrl(intent.getPaymentUrl())
                .expiresAt(intent.getExpiresAt())
                .build();
    }

    @Override
    @Transactional
    public void submitOfflineReceipt(Long applicationId, String userInn,
                                      MultipartFile receipt, ManualPaymentRequest info) {
        User user = loadUser(userInn);
        LicenseApplication app = loadApp(applicationId);
        ensureOwnership(app, user);

        if (app.getStatus() != LicenseApplicationStatus.DRAFT
                && app.getStatus() != LicenseApplicationStatus.SUBMITTED) {
            throw new BusinessLogicException(
                    "Квитанцию можно прикладывать только на статусе DRAFT или SUBMITTED");
        }
        if (receipt == null || receipt.isEmpty()) {
            throw new BusinessLogicException("Квитанция не приложена");
        }
        if (receipt.getSize() > MAX_RECEIPT_SIZE) {
            throw new BusinessLogicException("Размер квитанции превышает 10 МБ");
        }

        // Удаляем активный онлайн-платёж, если есть
        paymentRepository.findActiveByApplicationId(applicationId).ifPresent(existing -> {
            if (existing.getStatus() == LicensePaymentStatus.PENDING
                    && !"MANUAL".equals(existing.getProvider())) {
                existing.setStatus(LicensePaymentStatus.EXPIRED);
                paymentRepository.save(existing);
            }
        });

        String objectKey = fileStorageService.upload(receipt, MINIO_FOLDER);

        LicensePayment p = new LicensePayment();
        p.setApplication(app);
        p.setProvider("MANUAL");
        p.setAmount(info.getAmount());
        p.setCurrency("KGS");
        p.setStatus(LicensePaymentStatus.PENDING); // ждёт ручного подтверждения сотрудником
        p.setPaymentMethod(LicensePaymentMethod.MANUAL_OFFLINE);
        p.setPaidAt(info.getPaidAt());
        p.setManualReceiptObjectKey(objectKey);
        p.setManualReceiptFileName(receipt.getOriginalFilename());
        paymentRepository.save(p);

        // Двигаем заявку в SUBMITTED, если она была в DRAFT.
        if (app.getStatus() == LicenseApplicationStatus.DRAFT) {
            LocalDateTime now = LocalDateTime.now();
            app.setStatus(LicenseApplicationStatus.SUBMITTED);
            app.setSubmittedAt(now);
            app.setDeadline(now.plusDays(30));
            applicationRepository.save(app);
        }

        log.info("Offline payment receipt submitted: paymentId={}, applicationId={}, amount={}",
                p.getId(), applicationId, info.getAmount());
    }

    @Override
    @Transactional
    public void confirmManualPayment(Long paymentId, String actorInn) {
        User actor = loadUser(actorInn);
        if (actor.getRole() != RoleEnum.EMPLOYEE
                && actor.getRole() != RoleEnum.MINISTRY
                && actor.getRole() != RoleEnum.ADMIN) {
            throw new UnauthorizedException("Подтверждать офлайн-оплату может только сотрудник МПРЭТН");
        }

        LicensePayment p = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Платёж не найден: " + paymentId));

        if (p.getStatus() != LicensePaymentStatus.PENDING) {
            throw new BusinessLogicException(
                    "Подтвердить можно только платёж со статусом PENDING. Текущий: " + p.getStatus().getValue());
        }
        if (p.getPaymentMethod() != LicensePaymentMethod.MANUAL_OFFLINE) {
            throw new BusinessLogicException("Этот эндпоинт только для офлайн-оплаты");
        }

        p.setStatus(LicensePaymentStatus.MANUAL_CONFIRMED);
        p.setManualConfirmedBy(actor);
        p.setManualConfirmedAt(LocalDateTime.now());
        paymentRepository.save(p);

        log.info("Manual payment confirmed: paymentId={}, by={}", paymentId, actorInn);
    }

    @Override
    @Transactional
    public void handleWebhook(String providerCode, String rawBody, String signature) {
        PaymentProvider provider = providerFactory.byCode(providerCode);

        LicensePaymentEvent event = new LicensePaymentEvent();
        event.setProvider(providerCode);
        event.setRawPayload(rawBody);
        event.setSignature(signature);

        boolean sigOk = provider.verifySignature(rawBody, signature);
        event.setIsSignatureValid(sigOk);
        if (!sigOk) {
            event.setEventType("invalid.signature");
            event.setProcessingError("Invalid webhook signature");
            eventRepository.save(event);
            log.warn("Webhook with invalid signature rejected: provider={}", providerCode);
            throw new BusinessLogicException("Invalid webhook signature");
        }

        WebhookEvent parsed = provider.parseWebhook(rawBody);
        event.setEventType(parsed.getType() != null ? parsed.getType().name().toLowerCase() : "unknown");

        LicensePayment p = parsed.getProviderOrderId() != null
                ? paymentRepository.findByProviderAndProviderOrderId(providerCode, parsed.getProviderOrderId()).orElse(null)
                : null;

        if (p == null) {
            event.setProcessingError("Payment not found by providerOrderId=" + parsed.getProviderOrderId());
            eventRepository.save(event);
            log.warn("Webhook for unknown order: provider={}, orderId={}", providerCode, parsed.getProviderOrderId());
            return;
        }
        event.setPayment(p);

        // Идемпотентность: если платёж уже в финальном статусе — игнорируем повторный webhook.
        if (p.getStatus() == LicensePaymentStatus.SUCCESS
                || p.getStatus() == LicensePaymentStatus.MANUAL_CONFIRMED
                || p.getStatus() == LicensePaymentStatus.FAILED
                || p.getStatus() == LicensePaymentStatus.EXPIRED) {
            event.setProcessingError("Payment already in terminal state: " + p.getStatus());
            eventRepository.save(event);
            log.info("Ignoring webhook for payment in terminal state: paymentId={}, status={}",
                    p.getId(), p.getStatus());
            return;
        }

        switch (parsed.getType()) {
            case PAYMENT_SUCCESS -> {
                // Сверка суммы
                if (parsed.getAmount() != null && p.getAmount() != null
                        && parsed.getAmount().compareTo(p.getAmount()) != 0) {
                    event.setProcessingError("Amount mismatch: expected="
                            + p.getAmount() + ", got=" + parsed.getAmount());
                    eventRepository.save(event);
                    log.warn("Webhook amount mismatch: paymentId={}", p.getId());
                    return;
                }
                p.setStatus(LicensePaymentStatus.SUCCESS);
                p.setPaidAt(parsed.getPaidAt() != null ? parsed.getPaidAt() : LocalDateTime.now());
                p.setReceiptUrl(parsed.getReceiptUrl());
                paymentRepository.save(p);

                LicenseApplication app = p.getApplication();
                if (app.getStatus() == LicenseApplicationStatus.PAYMENT_PENDING) {
                    LocalDateTime now = LocalDateTime.now();
                    app.setStatus(LicenseApplicationStatus.SUBMITTED);
                    if (app.getSubmittedAt() == null) app.setSubmittedAt(now);
                    if (app.getDeadline() == null) app.setDeadline(now.plusDays(30));
                    applicationRepository.save(app);
                }
                log.info("Payment succeeded: paymentId={}, applicationId={}", p.getId(), app.getId());
            }
            case PAYMENT_FAILED -> {
                p.setStatus(LicensePaymentStatus.FAILED);
                paymentRepository.save(p);
                LicenseApplication app = p.getApplication();
                if (app.getStatus() == LicenseApplicationStatus.PAYMENT_PENDING) {
                    app.setStatus(LicenseApplicationStatus.DRAFT);
                    applicationRepository.save(app);
                }
                log.info("Payment failed: paymentId={}, reason={}", p.getId(), parsed.getErrorMessage());
            }
            case PAYMENT_EXPIRED -> {
                p.setStatus(LicensePaymentStatus.EXPIRED);
                paymentRepository.save(p);
                LicenseApplication app = p.getApplication();
                if (app.getStatus() == LicenseApplicationStatus.PAYMENT_PENDING) {
                    app.setStatus(LicenseApplicationStatus.DRAFT);
                    applicationRepository.save(app);
                }
            }
            default -> event.setProcessingError("Unknown event type: " + parsed.getType());
        }
        eventRepository.save(event);
    }

    @Override
    public PaymentStatusResponse getStatus(Long applicationId, String userInn) {
        User user = loadUser(userInn);
        LicenseApplication app = loadApp(applicationId);
        ensureOwnership(app, user);

        LicensePayment p = paymentRepository.findActiveByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Активный платёж по заявке не найден: " + applicationId));

        return mapper.toPaymentStatus(p, app);
    }

    // ─────────────────────────── helpers ───────────────────────────

    private User loadUser(String inn) {
        return userRepository.findByInn(inn)
                .orElseThrow(() -> new UnauthorizedException("Пользователь не найден: " + inn));
    }

    private LicenseApplication loadApp(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Заявка не найдена: " + id));
    }

    private void ensureOwnership(LicenseApplication app, User user) {
        // Админы имеют полный доступ
        if (user.getRole() == RoleEnum.ADMIN
                || user.getRole() == RoleEnum.EMPLOYEE
                || user.getRole() == RoleEnum.MINISTRY) return;

        if (app.getSubmittedBy() == null || !app.getSubmittedBy().getId().equals(user.getId())) {
            throw new UnauthorizedException("Доступ запрещён: заявка принадлежит другому пользователю");
        }
    }

    private BigDecimal readAmountFromSettings() {
        return systemSettingRepository.findById(FEE_SETTING)
                .map(s -> {
                    try { return new BigDecimal(s.getValue()); }
                    catch (Exception e) { return DEFAULT_FEE; }
                })
                .orElse(DEFAULT_FEE);
    }

    /** Заглушка возврата URL для существующего intent (для идемпотентности).
     *  В реальности provider может хранить URL, но для простоты MVP используем orderId. */
    private String buildReturnPaymentUrl(LicensePayment p) {
        // Если провайдер не сохраняет URL — фронту достаточно orderId для составления URL.
        return "/mock-payment/" + p.getProviderOrderId();
    }
}
