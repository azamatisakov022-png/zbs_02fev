package kg.eco.operator.service;

import kg.eco.operator.dto.request.ManualPaymentRequest;
import kg.eco.operator.dto.response.PaymentIntentResponse;
import kg.eco.operator.dto.response.PaymentStatusResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Сервис оплаты госпошлины за лицензию. Провайдер-агностичная модель:
 * реальная интеграция реализуется через {@link kg.eco.operator.service.payment.PaymentProvider}.
 * До выбора провайдера активен MockPaymentProvider.
 */
public interface LicensePaymentService {

    /** Создаёт платёжное намерение у активного провайдера (онлайн-оплата). */
    PaymentIntentResponse createOnlineIntent(Long applicationId, String userInn, String returnUrl);

    /** Прикладывает скан квитанции офлайн-оплаты. Статус платежа — PENDING до подтверждения сотрудником. */
    void submitOfflineReceipt(Long applicationId, String userInn,
                              MultipartFile receipt, ManualPaymentRequest info);

    /** Ручное подтверждение офлайн-оплаты сотрудником МПРЭТН.
     *  Переводит платёж в MANUAL_CONFIRMED, заявку — в UNDER_REVIEW (если была SUBMITTED). */
    void confirmManualPayment(Long paymentId, String actorInn);

    /** Обработка webhook'а от платёжного провайдера. Идемпотентно по providerOrderId.
     *  Провайдер резолвится по пути /api/license-payments/webhook/{providerCode}. */
    void handleWebhook(String providerCode, String rawBody, String signature);

    /** Текущий статус платежа по заявке (для polling'а фронтом). */
    PaymentStatusResponse getStatus(Long applicationId, String userInn);
}
