package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CollectionPointStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    PLANNED("planned");

    private final String value;

    CollectionPointStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static CollectionPointStatus fromValue(String value) {
        for (CollectionPointStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
