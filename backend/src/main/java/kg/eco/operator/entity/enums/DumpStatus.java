package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DumpStatus {
    ACTIVE("active"),
    UNDER_CLEANUP("under_cleanup"),
    CLEANED("cleaned"),
    MONITORING("monitoring");

    private final String value;

    DumpStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DumpStatus fromValue(String value) {
        for (DumpStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
