package kg.eco.operator.service.payment;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Унифицированное событие от платёжного провайдера после разбора webhook'а.
 * Каждый провайдер приводит свой специфичный формат к этому типу.
 */
@Value
@Builder
public class WebhookEvent {

    public enum Type {
        PAYMENT_SUCCESS,
        PAYMENT_FAILED,
        PAYMENT_EXPIRED,
        UNKNOWN
    }

    /** Тип события. UNKNOWN — если не удалось распарсить. */
    Type type;

    /** ID заказа у провайдера, по которому находим payment в БД. */
    String providerOrderId;

    /** Сумма платежа, пришедшая от провайдера (для сверки с ожидаемой). */
    BigDecimal amount;

    /** Время оплаты по данным провайдера (для PAYMENT_SUCCESS). */
    LocalDateTime paidAt;

    /** Ссылка на квитанцию/чек у провайдера. */
    String receiptUrl;

    /** Код ошибки провайдера (для PAYMENT_FAILED). */
    String errorCode;

    /** Человекочитаемое сообщение об ошибке. */
    String errorMessage;
}
