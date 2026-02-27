package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentConfirmationStatus {
    PENDING("pending"),
    CONFIRMED("confirmed"),
    REJECTED("rejected");

    private final String value;

    PaymentConfirmationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PaymentConfirmationStatus fromValue(String value) {
        for (PaymentConfirmationStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
