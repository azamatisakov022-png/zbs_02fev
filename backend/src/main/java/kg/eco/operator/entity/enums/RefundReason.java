package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RefundReason {
    EXPORT("export"),
    RECYCLING("recycling"),
    OVERPAYMENT("overpayment"),
    ERROR("error");

    private final String value;

    RefundReason(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RefundReason fromValue(String value) {
        for (RefundReason s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
