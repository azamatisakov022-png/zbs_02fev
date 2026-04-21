package kg.eco.operator.service.payment;

/**
 * Унифицированный статус платежа, возвращаемый провайдером.
 * Мапится один в один на payments.status.
 */
public enum PaymentStatus {
    PENDING,
    SUCCESS,
    FAILED,
    EXPIRED,
    MANUAL_CONFIRMED,
    UNKNOWN
}
