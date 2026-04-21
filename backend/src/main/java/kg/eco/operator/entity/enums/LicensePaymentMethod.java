package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Способ оплаты госпошлины за лицензию.
 * Отдельный enum от существующего PaymentMethod (BANK_TRANSFER/ONLINE/CASH),
 * т.к. нужны более детальные значения для лицензионных платежей.
 */
public enum LicensePaymentMethod {
    CARD("card"),                       // онлайн картой через платёжный шлюз
    QR("qr"),                           // онлайн по QR-коду
    BANK_TRANSFER("bank_transfer"),     // банковский перевод
    MANUAL_OFFLINE("manual_offline");   // оплачено офлайн, прикреплена квитанция

    private final String value;

    LicensePaymentMethod(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LicensePaymentMethod fromValue(String value) {
        for (LicensePaymentMethod s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown LicensePaymentMethod: " + value);
    }
}
