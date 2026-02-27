package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RefundStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected"),
    PROCESSED("processed");

    private final String value;

    RefundStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RefundStatus fromValue(String value) {
        for (RefundStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
