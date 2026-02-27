package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LandfillStatus {
    ACTIVE("active"),
    CLOSED("closed"),
    PLANNED("planned"),
    RECULTIVATION("recultivation");

    private final String value;

    LandfillStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LandfillStatus fromValue(String value) {
        for (LandfillStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
