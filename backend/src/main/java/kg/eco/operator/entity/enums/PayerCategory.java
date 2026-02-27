package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PayerCategory {
    IMPORTER("importer"),
    PRODUCER("producer"),
    IMPORTER_PRODUCER("importer_producer");

    private final String value;

    PayerCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PayerCategory fromValue(String value) {
        for (PayerCategory s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
