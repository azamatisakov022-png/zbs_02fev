package kg.eco.operator.service.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kg.eco.operator.entity.LicenseApplication;
import kg.eco.operator.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mock-провайдер платежей для локальной разработки и интеграционных тестов.
 *
 * Поведение:
 *   - createIntent() возвращает URL вида {app.base-url}/mock-payment/{orderId},
 *     где фронт рисует форму с кнопками "Успешная оплата" / "Отказ" / "Таймаут".
 *   - verifySignature() всегда true (разработка).
 *   - parseWebhook() принимает простой JSON:
 *       {
 *         "event": "payment.success" | "payment.failed" | "payment.expired",
 *         "orderId": "...",
 *         "amount": 1000,
 *         "paidAt": "2026-04-21T10:00:00",
 *         "receiptUrl": "http://localhost/mock-receipt.pdf"
 *       }
 *
 * Активируется, если system_settings.payment_provider_active = 'MOCK'.
 * Для продакшена замените на реального провайдера (не удаляйте — используется в тестах).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MockPaymentProvider implements PaymentProvider {

    public static final String CODE = "MOCK";

    private final ObjectMapper objectMapper;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Override
    public String code() {
        return CODE;
    }

    @Override
    public PaymentIntent createIntent(LicenseApplication application, BigDecimal amount, String returnUrl) {
        String orderId = "MOCK-" + UUID.randomUUID();
        String paymentUrl = appBaseUrl + "/mock-payment/" + orderId
                + "?amount=" + amount
                + "&applicationId=" + application.getId()
                + "&returnUrl=" + returnUrl;

        log.info("Mock payment intent created: orderId={}, amount={}, applicationId={}",
                orderId, amount, application.getId());

        return PaymentIntent.builder()
                .paymentUrl(paymentUrl)
                .providerOrderId(orderId)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
    }

    @Override
    public boolean verifySignature(String rawBody, String signature) {
        // В mock-режиме подпись не валидируем. В проде — HMAC-SHA256 с секретом провайдера.
        return true;
    }

    @Override
    public WebhookEvent parseWebhook(String rawBody) {
        try {
            JsonNode json = objectMapper.readTree(rawBody);
            String eventType = json.path("event").asText("");
            String orderId = json.path("orderId").asText(null);
            BigDecimal amount = json.has("amount")
                    ? new BigDecimal(json.get("amount").asText())
                    : null;
            String receiptUrl = json.path("receiptUrl").asText(null);
            String paidAtStr = json.path("paidAt").asText(null);
            LocalDateTime paidAt = paidAtStr != null ? LocalDateTime.parse(paidAtStr) : null;

            WebhookEvent.Type type = switch (eventType) {
                case "payment.success" -> WebhookEvent.Type.PAYMENT_SUCCESS;
                case "payment.failed"  -> WebhookEvent.Type.PAYMENT_FAILED;
                case "payment.expired" -> WebhookEvent.Type.PAYMENT_EXPIRED;
                default                -> WebhookEvent.Type.UNKNOWN;
            };

            return WebhookEvent.builder()
                    .type(type)
                    .providerOrderId(orderId)
                    .amount(amount)
                    .paidAt(paidAt)
                    .receiptUrl(receiptUrl)
                    .errorCode(json.path("errorCode").asText(null))
                    .errorMessage(json.path("errorMessage").asText(null))
                    .build();

        } catch (Exception e) {
            log.warn("Failed to parse mock webhook payload: {}", e.getMessage());
            return WebhookEvent.builder()
                    .type(WebhookEvent.Type.UNKNOWN)
                    .build();
        }
    }

    @Override
    public PaymentStatus fetchStatus(Payment payment) {
        // В mock-режиме всегда возвращаем текущий статус из БД.
        // В проде — HTTP-запрос к API провайдера.
        try {
            return PaymentStatus.valueOf(payment.getStatus());
        } catch (IllegalArgumentException e) {
            return PaymentStatus.UNKNOWN;
        }
    }
}
