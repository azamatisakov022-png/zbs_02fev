package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Статус платежа госпошлины по заявке на лицензию.
 * Отдельный enum (не PaymentConfirmationStatus), т.к. вокабуляр другой:
 *   - утильсборные платежи: PENDING/CONFIRMED/REJECTED (ручное подтверждение)
 *   - лицензионные платежи: PENDING/SUCCESS/FAILED/EXPIRED/MANUAL_CONFIRMED
 *     (онлайн-провайдер или ручное подтверждение)
 */
public enum LicensePaymentStatus {
    PENDING("pending"),                     // ожидает подтверждения от провайдера
    SUCCESS("success"),                     // онлайн-оплата успешна
    FAILED("failed"),                       // провайдер вернул отказ
    EXPIRED("expired"),                     // истёк таймаут ожидания
    MANUAL_CONFIRMED("manual_confirmed");   // офлайн-оплата, подтверждена сотрудником

    private final String value;

    LicensePaymentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LicensePaymentStatus fromValue(String value) {
        for (LicensePaymentStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown LicensePaymentStatus: " + value);
    }

    public boolean isPaid() {
        return this == SUCCESS || this == MANUAL_CONFIRMED;
    }

    public boolean isActive() {
        return this == PENDING || this == SUCCESS || this == MANUAL_CONFIRMED;
    }
}
