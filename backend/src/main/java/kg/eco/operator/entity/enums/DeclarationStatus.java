package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DeclarationStatus {
    DRAFT("draft"),
    SUBMITTED("submitted"),
    UNDER_REVIEW("under_review"),
    APPROVED("approved"),
    REJECTED("rejected"),
    REVISION_REQUESTED("revision_requested");

    private final String value;

    DeclarationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DeclarationStatus fromValue(String value) {
        for (DeclarationStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
