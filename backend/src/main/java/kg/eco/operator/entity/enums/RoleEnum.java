package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RoleEnum {
    BUSINESS("business"),
    ECO_OPERATOR("eco-operator"),
    MINISTRY("ministry"),
    ADMIN("admin"),
    EMPLOYEE("employee"),
    GUEST("guest");

    private final String value;

    RoleEnum(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RoleEnum fromValue(String value) {
        for (RoleEnum s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown value: " + value);
    }
}
