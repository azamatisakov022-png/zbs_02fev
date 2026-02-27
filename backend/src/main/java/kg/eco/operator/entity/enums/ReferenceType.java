package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReferenceType {
    CALCULATION("calculation"),
    PAYMENT("payment"),
    REPORT("report"),
    REFUND("refund"),
    CORRECTION("correction");

    private final String value;

    ReferenceType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ReferenceType fromValue(String value) {
        for (ReferenceType s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
