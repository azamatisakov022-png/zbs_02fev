package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductGroupType {
    PRODUCT("product"),
    PACKAGING("packaging");

    private final String value;

    ProductGroupType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ProductGroupType fromValue(String value) {
        for (ProductGroupType t : values()) {
            if (t.value.equalsIgnoreCase(value)) return t;
        }
        throw new IllegalArgumentException("Unknown ProductGroupType: " + value);
    }
}
