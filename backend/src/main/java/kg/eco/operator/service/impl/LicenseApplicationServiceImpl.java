package kg.eco.operator.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import kg.eco.operator.dto.mapper.LicenseMapper;
import kg.eco.operator.dto.request.ApproveLicenseApplicationRequest;
import kg.eco.operator.dto.request.CreateLicenseApplicationRequest;
import kg.eco.operator.dto.request.RejectLicenseApplicationRequest;
import kg.eco.operator.dto.request.SiteVisitRequest;
import kg.eco.operator.dto.request.SubmitLicenseApplicationRequest;
import kg.eco.operator.dto.response.LicenseApplicationResponse;
import kg.eco.operator.dto.response.PaymentIntentResponse;
import kg.eco.operator.entity.License;
import kg.eco.operator.entity.LicenseApplication;
import kg.eco.operator.entity.LicenseApplicationDocument;
import kg.eco.operator.entity.LicenseApplicationRevision;
import kg.eco.operator.entity.LicensePayment;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.ApplicantType;
import kg.eco.operator.entity.enums.LicenseApplicationStatus;
import kg.eco.operator.entity.enums.LicenseDocumentType;
import kg.eco.operator.entity.enums.LicensePaymentStatus;
import kg.eco.operator.entity.enums.LicenseType;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.exception.UnauthorizedException;
import kg.eco.operator.repository.LicenseApplicationDocumentRepository;
import kg.eco.operator.repository.LicenseApplicationRepository;
import kg.eco.operator.repository.LicenseApplicationRevisionRepository;
import kg.eco.operator.repository.LicenseNumberCounterRepository;
import kg.eco.operator.repository.LicensePaymentRepository;
import kg.eco.operator.repository.LicenseRepository;
import kg.eco.operator.repository.SystemSettingRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.FileStorageService;
import kg.eco.operator.service.LicenseApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Реализация бизнес-логики заявок на лицензию.
 * State machine:
 *   DRAFT → PAYMENT_PENDING → SUBMITTED → UNDER_REVIEW → SITE_VISIT_DONE → APPROVED
 *                                                                       → REJECTED
 *   DRAFT ──(submit offline)──▶ SUBMITTED
 *   REJECTED ──(reopen)──▶ DRAFT (платёж сохраняется)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LicenseApplicationServiceImpl implements LicenseApplicationService {

    private static final String MINIO_FOLDER = "licenses/documents";
    private static final long MAX_DOC_SIZE = 10L * 1024 * 1024; // 10 МБ, как в ContestApplicationService
    private static final String DEADLINE_DAYS_SETTING = "license_review_deadline_days";
    private static final int DEFAULT_DEADLINE_DAYS = 30;

    private final LicenseApplicationRepository applicationRepository;
    private final LicenseApplicationDocumentRepository documentRepository;
    private final LicenseApplicationRevisionRepository revisionRepository;
    private final LicenseRepository licenseRepository;
    private final LicenseNumberCounterRepository counterRepository;
    private final LicensePaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final FileStorageService fileStorageService;
    private final LicenseMapper mapper;
    private final ObjectMapper objectMapper;

    // ─────────────────────────── заявитель ───────────────────────────

    @Override
    @Transactional
    public LicenseApplicationResponse createDraft(String userInn, CreateLicenseApplicationRequest request) {
        User user = loadUser(userInn);

        LicenseApplication app = new LicenseApplication();
        applyRequestFields(app, request);
        app.setStatus(LicenseApplicationStatus.DRAFT);
        app.setSubmittedBy(user);

        LicenseApplication saved = applicationRepository.save(app);
        log.info("License application draft created: id={}, user={}", saved.getId(), userInn);
        return buildResponse(saved);
    }

    @Override
    @Transactional
    public LicenseApplicationResponse updateDraft(Long id, String userInn, CreateLicenseApplicationRequest request) {
        LicenseApplication app = loadAndEnsureOwnership(id, userInn);
        if (app.getStatus() != LicenseApplicationStatus.DRAFT) {
            throw new BusinessLogicException("Редактирование возможно только для статуса DRAFT");
        }
        applyRequestFields(app, request);
        return buildResponse(applicationRepository.save(app));
    }

    @Override
    @Transactional
    public PaymentIntentResponse submit(Long id, String userInn, SubmitLicenseApplicationRequest request) {
        LicenseApplication app = loadAndEnsureOwnership(id, userInn);
        if (app.getStatus() != LicenseApplicationStatus.DRAFT) {
            throw new BusinessLogicException("Отправить можно только заявку в статусе DRAFT");
        }

        validateReadyForSubmit(app);
        // Проверка обязательности документов отключена для демо.
        // В проде активировать через system_settings.license_require_all_documents=true.
        if (isDocumentValidationRequired()) {
            validateRequiredDocumentsUploaded(app);
        }

        LocalDateTime now = LocalDateTime.now();
        int deadlineDays = readIntSetting(DEADLINE_DAYS_SETTING, DEFAULT_DEADLINE_DAYS);

        String mode = request.getPaymentMode() == null ? "online" : request.getPaymentMode().toLowerCase();

        // снимок ревизии до смены статуса
        saveRevision(app);

        if ("offline".equals(mode)) {
            // Офлайн-оплата: квитанцию заявитель прикладывает отдельно (см. LicensePaymentService#submitOfflineReceipt).
            // Здесь просто переводим заявку в SUBMITTED. Если payment ещё не создан — сервис платежей его создаст.
            app.setStatus(LicenseApplicationStatus.SUBMITTED);
            app.setSubmittedAt(now);
            app.setDeadline(now.plusDays(deadlineDays));
            applicationRepository.save(app);
            log.info("License application submitted (offline): id={}, deadline={}", app.getId(), app.getDeadline());
            return null; // фронт для offline-режима не ждёт intent
        }

        // По умолчанию online: заявка уходит в PAYMENT_PENDING.
        // Создание payment intent делается сервисом платежей (LicensePaymentServiceImpl).
        // Здесь только меняем статус — отдельный вызов /pay должен быть следующим шагом фронта.
        app.setStatus(LicenseApplicationStatus.PAYMENT_PENDING);
        app.setSubmittedAt(now);
        app.setDeadline(now.plusDays(deadlineDays));
        applicationRepository.save(app);
        log.info("License application moved to PAYMENT_PENDING: id={}", app.getId());
        // Intent создаст фронт следующим запросом; здесь возвращаем null, реальный intent
        // возвращается эндпоинтом /pay (LicensePaymentService#createOnlineIntent).
        return null;
    }

    @Override
    @Transactional
    public LicenseApplicationResponse reopen(Long id, String userInn) {
        LicenseApplication app = loadAndEnsureOwnership(id, userInn);
        if (!app.getStatus().canBeReopened()) {
            throw new BusinessLogicException(
                    "Переоткрыть можно только отклонённую заявку (REJECTED). Текущий статус: "
                            + app.getStatus().getValue());
        }
        if (app.getRejectionReason() != null && !app.getRejectionReason().isFixable()) {
            throw new BusinessLogicException("Отказ по неустранимой причине, повторная подача невозможна");
        }

        app.setStatus(LicenseApplicationStatus.DRAFT);
        app.setRejectionReason(null);
        app.setRejectionComment(null);
        app.setRejectionDecisionBy(null);
        app.setRejectionDecisionAt(null);
        app.setSubmittedAt(null);
        app.setDeadline(null);
        app.setSiteVisitDone(false);
        app.setSiteVisitDate(null);
        app.setSiteVisitInspector(null);
        app.setSiteVisitComment(null);
        app.setReopenedCount(app.getReopenedCount() + 1);

        LicenseApplication saved = applicationRepository.save(app);
        log.info("License application reopened: id={}, count={}", saved.getId(), saved.getReopenedCount());
        return buildResponse(saved);
    }

    @Override
    public LicenseApplicationResponse getMyApplication(Long id, String userInn) {
        return buildResponse(loadAndEnsureOwnership(id, userInn));
    }

    @Override
    public List<LicenseApplicationResponse> getMyApplications(String userInn) {
        User user = loadUser(userInn);
        return applicationRepository.findBySubmittedBy_IdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LicenseApplicationResponse uploadDocument(Long applicationId, String userInn,
                                                     LicenseDocumentType docType, MultipartFile file) {
        LicenseApplication app = loadAndEnsureOwnership(applicationId, userInn);
        if (app.getStatus() != LicenseApplicationStatus.DRAFT) {
            throw new BusinessLogicException("Документы можно загружать только в статусе DRAFT");
        }
        validateFile(file);

        // Если документ такого типа уже есть — заменяем
        documentRepository.findByApplication_IdAndDocType(applicationId, docType).ifPresent(existing -> {
            try { fileStorageService.delete(existing.getFileObjectKey()); } catch (Exception e) {
                log.warn("Failed to delete old document file {}: {}", existing.getFileObjectKey(), e.getMessage());
            }
            documentRepository.delete(existing);
        });

        String objectKey = fileStorageService.upload(file, MINIO_FOLDER);
        LicenseApplicationDocument doc = new LicenseApplicationDocument();
        doc.setApplication(app);
        doc.setDocType(docType);
        doc.setFileObjectKey(objectKey);
        doc.setFileName(file.getOriginalFilename());
        doc.setFileSize(file.getSize());
        doc.setUploadedBy(loadUser(userInn));
        documentRepository.save(doc);

        return buildResponse(app);
    }

    @Override
    @Transactional
    public void deleteDocument(Long applicationId, Long docId, String userInn) {
        LicenseApplication app = loadAndEnsureOwnership(applicationId, userInn);
        if (app.getStatus() != LicenseApplicationStatus.DRAFT) {
            throw new BusinessLogicException("Удаление документов возможно только в DRAFT");
        }
        LicenseApplicationDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Документ не найден: " + docId));
        if (!doc.getApplication().getId().equals(applicationId)) {
            throw new BusinessLogicException("Документ относится к другой заявке");
        }
        try { fileStorageService.delete(doc.getFileObjectKey()); } catch (Exception e) {
            log.warn("Failed to delete file {}: {}", doc.getFileObjectKey(), e.getMessage());
        }
        documentRepository.delete(doc);
    }

    // ─────────────────────────── сотрудник МПРЭТН ───────────────────────────

    @Override
    public List<LicenseApplicationResponse> listAll(LicenseApplicationStatus statusFilter,
                                                     LicenseType typeFilter,
                                                     Boolean overdueOnly) {
        // MVP: простой in-memory фильтр. При росте данных перевести на Specification.
        LocalDateTime now = LocalDateTime.now();
        return applicationRepository.findAll().stream()
                .filter(a -> statusFilter == null || a.getStatus() == statusFilter)
                .filter(a -> typeFilter == null || a.getLicenseType() == typeFilter)
                .filter(a -> !Boolean.TRUE.equals(overdueOnly) ||
                        (a.getDeadline() != null && a.getDeadline().isBefore(now)
                                && a.getStatus().isActiveForReview()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LicenseApplicationResponse getById(Long id) {
        return buildResponse(loadApplication(id));
    }

    @Override
    @Transactional
    public LicenseApplicationResponse acceptForReview(Long id, String actorInn) {
        LicenseApplication app = loadApplication(id);
        if (app.getStatus() != LicenseApplicationStatus.SUBMITTED) {
            throw new BusinessLogicException(
                    "Принять к рассмотрению можно только SUBMITTED. Текущий статус: " + app.getStatus().getValue());
        }
        app.setStatus(LicenseApplicationStatus.UNDER_REVIEW);
        applicationRepository.save(app);
        log.info("License application accepted: id={}, by={}", id, actorInn);
        return buildResponse(app);
    }

    @Override
    @Transactional
    public LicenseApplicationResponse reject(Long id, String actorInn, RejectLicenseApplicationRequest request) {
        LicenseApplication app = loadApplication(id);
        if (!app.getStatus().isActiveForReview()) {
            throw new BusinessLogicException(
                    "Отклонить можно только активную к рассмотрению заявку. Текущий статус: "
                            + app.getStatus().getValue());
        }
        User actor = loadUser(actorInn);
        app.setStatus(LicenseApplicationStatus.REJECTED);
        app.setRejectionReason(request.getReason());
        app.setRejectionComment(request.getComment());
        app.setRejectionDecisionBy(actor);
        app.setRejectionDecisionAt(LocalDateTime.now());
        applicationRepository.save(app);
        log.info("License application rejected: id={}, reason={}, by={}", id, request.getReason(), actorInn);
        return buildResponse(app);
    }

    @Override
    @Transactional
    public LicenseApplicationResponse recordSiteVisit(Long id, String actorInn, SiteVisitRequest request) {
        LicenseApplication app = loadApplication(id);
        if (app.getStatus() != LicenseApplicationStatus.UNDER_REVIEW
                && app.getStatus() != LicenseApplicationStatus.SITE_VISIT_DONE) {
            throw new BusinessLogicException(
                    "Данные выезда можно вносить только на этапе UNDER_REVIEW. Текущий статус: "
                            + app.getStatus().getValue());
        }
        app.setSiteVisitDone(true);
        app.setSiteVisitDate(request.getDate());
        app.setSiteVisitInspector(request.getInspector());
        app.setSiteVisitComment(request.getComment());
        app.setStatus(LicenseApplicationStatus.SITE_VISIT_DONE);
        applicationRepository.save(app);
        log.info("Site visit recorded: id={}, by={}", id, actorInn);
        return buildResponse(app);
    }

    @Override
    @Transactional
    public LicenseApplicationResponse approve(Long id, String actorInn, ApproveLicenseApplicationRequest request) {
        LicenseApplication app = loadApplication(id);
        if (app.getStatus() != LicenseApplicationStatus.SITE_VISIT_DONE) {
            throw new BusinessLogicException(
                    "Выдать лицензию можно только после выезда на объект (SITE_VISIT_DONE). Текущий статус: "
                            + app.getStatus().getValue());
        }
        if (request.getValidUntil() == null || !request.getValidUntil().isAfter(LocalDate.now())) {
            throw new BusinessLogicException("Срок действия лицензии должен быть в будущем");
        }
        // Проверка успешного платежа
        LicensePayment payment = paymentRepository.findActiveByApplicationId(id).orElse(null);
        if (payment == null || !payment.getStatus().isPaid()) {
            throw new BusinessLogicException(
                    "Нельзя выдать лицензию без подтверждённой оплаты госпошлины");
        }

        User actor = loadUser(actorInn);
        int year = LocalDate.now().getYear();
        Integer counter = counterRepository.incrementAndGet(year);
        String licenseNumber = String.format("ЛП-%d-%04d", year, counter);

        License license = new License();
        license.setLicenseNumber(licenseNumber);
        license.setApplication(app);
        license.setApplicantType(app.getApplicantType());
        license.setApplicantId(app.getApplicantId());
        license.setApplicantName(app.getApplicantName());
        license.setApplicantInn(app.getApplicantInn());
        license.setLicenseType(app.getLicenseType());
        license.setActivityTypes(app.getActivityTypes());
        license.setLegalAddress(app.getLegalAddress());
        license.setActualAddress(app.getActualAddress());
        license.setIssuedAt(LocalDate.now());
        license.setValidUntil(request.getValidUntil());
        license.setIsPublished(true);
        license.setIsRevoked(false);
        license.setIssuedBy(actor);
        licenseRepository.save(license);

        app.setStatus(LicenseApplicationStatus.APPROVED);
        applicationRepository.save(app);

        log.info("License issued: number={}, applicationId={}, by={}", licenseNumber, id, actorInn);
        return buildResponse(app);
    }

    @Override
    public Map<String, Long> getStatusCounts() {
        LocalDateTime now = LocalDateTime.now();
        Map<String, Long> counts = new LinkedHashMap<>();
        for (LicenseApplicationStatus s : LicenseApplicationStatus.values()) {
            counts.put(s.getValue(), applicationRepository.countByStatus(s));
        }
        counts.put("overdue", applicationRepository.countOverdue(now));
        return counts;
    }

    // ─────────────────────────── helpers ───────────────────────────

    private User loadUser(String userInn) {
        return userRepository.findByInn(userInn)
                .orElseThrow(() -> new UnauthorizedException("Пользователь не найден: " + userInn));
    }

    private LicenseApplication loadApplication(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Заявка на лицензию не найдена: " + id));
    }

    private LicenseApplication loadAndEnsureOwnership(Long id, String userInn) {
        LicenseApplication app = loadApplication(id);
        User user = loadUser(userInn);
        // Для не-BUSINESS ролей доступ через admin-эндпоинты — эта проверка только для ЛК заявителя.
        if (user.getRole() != RoleEnum.BUSINESS) {
            throw new UnauthorizedException("Этот эндпоинт доступен только заявителю (BUSINESS)");
        }
        if (app.getSubmittedBy() == null || !app.getSubmittedBy().getId().equals(user.getId())) {
            throw new UnauthorizedException("Доступ запрещён: заявка принадлежит другому пользователю");
        }
        return app;
    }

    private void applyRequestFields(LicenseApplication app, CreateLicenseApplicationRequest r) {
        app.setApplicantType(r.getApplicantType());
        app.setApplicantId(r.getApplicantType() == ApplicantType.OTHER ? null : r.getApplicantId());
        app.setApplicantEntity(r.getApplicantEntity());
        app.setApplicantName(r.getApplicantName().trim());
        app.setApplicantInn(r.getApplicantInn().trim());
        app.setLicenseType(r.getLicenseType());
        app.setActivityTypes(r.getActivityTypes().toArray(new String[0]));
        app.setLegalAddress(r.getLegalAddress());
        app.setActualAddress(r.getActualAddress());
        app.setContactPhone(r.getContactPhone());
        app.setContactEmail(r.getContactEmail());
        app.setContactPerson(r.getContactPerson());
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessLogicException("Файл не передан");
        }
        if (file.getSize() > MAX_DOC_SIZE) {
            throw new BusinessLogicException("Размер файла превышает 10 МБ");
        }
    }

    /**
     * Полная проверка заявки перед отправкой (все поля, которые DTO делает
     * опциональными для DRAFT-сохранения, становятся обязательными здесь).
     */
    private void validateReadyForSubmit(LicenseApplication app) {
        if (app.getActivityTypes() == null || app.getActivityTypes().length == 0) {
            throw new BusinessLogicException("Укажите хотя бы один вид деятельности (Шаг 1 «Лицензия»)");
        }
        if (app.getLegalAddress() == null || app.getLegalAddress().isBlank()) {
            // Юр. адрес теперь подтягивается автоматически из профиля компании
            // (companies.address) — но если по каким-то причинам он пуст, просим
            // дополнить профиль, а не данные заявки.
            throw new BusinessLogicException(
                    "В профиле компании не указан юридический адрес — обновите профиль");
        }
        if (app.getActualAddress() == null || app.getActualAddress().isBlank()) {
            throw new BusinessLogicException(
                    "Укажите фактический адрес объекта (Шаг 2 «Объект и контакты»)");
        }
    }

    /**
     * Флаг из system_settings: требовать ли загрузку всех обязательных документов
     * при submit. По умолчанию false (для демо и разработки). В продакшене
     * переключить на true через админку.
     */
    private boolean isDocumentValidationRequired() {
        return systemSettingRepository.findById("license_require_all_documents")
                .map(s -> "true".equalsIgnoreCase(s.getValue()))
                .orElse(false);
    }

    private void validateRequiredDocumentsUploaded(LicenseApplication app) {
        Set<LicenseDocumentType> required = LicenseDocumentType.requiredFor(app.getLicenseType());
        List<LicenseApplicationDocument> docs = documentRepository
                .findByApplication_IdOrderByUploadedAtAsc(app.getId());
        Set<LicenseDocumentType> uploaded = docs.stream()
                .map(LicenseApplicationDocument::getDocType)
                .collect(Collectors.toSet());
        for (LicenseDocumentType need : required) {
            if (!uploaded.contains(need)) {
                throw new BusinessLogicException(
                        "Не загружен обязательный документ: " + need.getValue());
            }
        }
    }

    private int readIntSetting(String key, int defaultValue) {
        return systemSettingRepository.findById(key)
                .map(s -> {
                    try { return Integer.parseInt(s.getValue()); }
                    catch (Exception e) { return defaultValue; }
                }).orElse(defaultValue);
    }

    private void saveRevision(LicenseApplication app) {
        try {
            int nextNumber = revisionRepository
                    .findTopByApplication_IdOrderByRevisionNumberDesc(app.getId())
                    .map(r -> r.getRevisionNumber() + 1)
                    .orElse(1);

            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("status", app.getStatus() != null ? app.getStatus().getValue() : null);
            snapshot.put("licenseType", app.getLicenseType() != null ? app.getLicenseType().getValue() : null);
            snapshot.put("applicantName", app.getApplicantName());
            snapshot.put("applicantInn", app.getApplicantInn());
            snapshot.put("legalAddress", app.getLegalAddress());
            snapshot.put("actualAddress", app.getActualAddress());
            snapshot.put("activityTypes", app.getActivityTypes());
            snapshot.put("submittedAt", app.getSubmittedAt() != null ? app.getSubmittedAt().toString() : null);
            snapshot.put("rejectionReason", app.getRejectionReason() != null ? app.getRejectionReason().getValue() : null);

            LicenseApplicationRevision rev = new LicenseApplicationRevision();
            rev.setApplication(app);
            rev.setRevisionNumber(nextNumber);
            rev.setSnapshot(objectMapper.writeValueAsString(snapshot));
            revisionRepository.save(rev);
        } catch (Exception e) {
            log.warn("Failed to save revision for application {}: {}", app.getId(), e.getMessage());
        }
    }

    private LicenseApplicationResponse buildResponse(LicenseApplication app) {
        List<LicenseApplicationDocument> docs = documentRepository
                .findByApplication_IdOrderByUploadedAtAsc(app.getId());
        LicensePayment payment = paymentRepository.findActiveByApplicationId(app.getId()).orElse(null);
        License license = licenseRepository.findAll().stream()
                .filter(l -> l.getApplication() != null && l.getApplication().getId().equals(app.getId()))
                .findFirst().orElse(null);
        return mapper.toResponse(app, docs, payment, license);
    }
}
