package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Организационно-правовая форма заявителя на лицензию.
 * Физические лица в MVP не поддерживаются (подтверждено заказчиком).
 */
public enum ApplicantEntity {
    LEGAL_ENTITY("legal_entity"),      // юридическое лицо
    SOLE_PROPRIETOR("sole_proprietor"); // индивидуальный предприниматель

    private final String value;

    ApplicantEntity(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ApplicantEntity fromValue(String value) {
        for (ApplicantEntity s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown ApplicantEntity: " + value);
    }
}
