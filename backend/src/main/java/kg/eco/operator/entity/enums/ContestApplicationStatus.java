package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ContestApplicationStatus {
    NEW("new"),
    UNDER_REVIEW("under_review"),
    APPROVED("approved"),
    REJECTED("rejected");

    private final String value;

    ContestApplicationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ContestApplicationStatus fromValue(String value) {
        for (ContestApplicationStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
