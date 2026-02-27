package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LandfillType {
    MUNICIPAL("municipal"),
    INDUSTRIAL("industrial"),
    HAZARDOUS("hazardous"),
    MIXED("mixed");

    private final String value;

    LandfillType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LandfillType fromValue(String value) {
        for (LandfillType s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
