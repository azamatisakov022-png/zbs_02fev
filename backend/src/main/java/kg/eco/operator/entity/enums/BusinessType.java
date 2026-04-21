package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Тип бизнес-пользователя. Применим только к role=BUSINESS.
 * Определяет, какие разделы меню видит пользователь в своём ЛК.
 */
public enum BusinessType {
    PAYER("payer"),         // плательщик утильсбора
    APPLICANT("applicant"), // заявитель на лицензию (переработчик и т.п.)
    BOTH("both");           // и то, и другое (редкий случай)

    private final String value;

    BusinessType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static BusinessType fromValue(String value) {
        for (BusinessType s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown BusinessType: " + value);
    }
}
