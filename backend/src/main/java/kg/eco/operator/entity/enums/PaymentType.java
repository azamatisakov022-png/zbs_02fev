package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentType {
    FEE("fee"),
    PENALTY("penalty");

    private final String value;

    PaymentType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PaymentType fromValue(String value) {
        for (PaymentType t : values()) {
            if (t.value.equalsIgnoreCase(value)) return t;
        }
        throw new IllegalArgumentException("Unknown PaymentType: " + value);
    }
}
