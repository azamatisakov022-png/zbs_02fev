package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReportStatus {
    DRAFT("draft"),
    SUBMITTED("submitted"),
    UNDER_REVIEW("under_review"),
    APPROVED("approved"),
    REJECTED("rejected"),
    REVISION_REQUESTED("revision_requested");

    private final String value;

    ReportStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ReportStatus fromValue(String value) {
        for (ReportStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
