package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ContestStatus {
    DRAFT("draft"),
    PUBLISHED("published"),
    CLOSED("closed");

    private final String value;

    ContestStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ContestStatus fromValue(String value) {
        for (ContestStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
