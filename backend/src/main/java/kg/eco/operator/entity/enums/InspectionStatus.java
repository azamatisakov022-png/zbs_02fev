package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum InspectionStatus {
    COMPLIANT("compliant"),
    VIOLATIONS_FOUND("violations_found"),
    REINSPECTION_REQUIRED("reinspection_required"),
    NOT_INSPECTED("not_inspected");

    private final String value;

    InspectionStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static InspectionStatus fromValue(String value) {
        for (InspectionStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
