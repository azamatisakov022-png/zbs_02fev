package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RecyclerDocumentType {
    LICENSE("license"),
    ECO_PASSPORT("eco_passport"),
    CERTIFICATE("certificate"),
    INSPECTION_ACT("inspection_act"),
    OTHER("other");

    private final String value;

    RecyclerDocumentType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RecyclerDocumentType fromValue(String value) {
        for (RecyclerDocumentType s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
