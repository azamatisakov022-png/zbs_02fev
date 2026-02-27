package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PayerSubcategory {
    LARGE("large"),
    MEDIUM("medium"),
    SMALL("small"),
    MICRO("micro");

    private final String value;

    PayerSubcategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PayerSubcategory fromValue(String value) {
        for (PayerSubcategory s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
