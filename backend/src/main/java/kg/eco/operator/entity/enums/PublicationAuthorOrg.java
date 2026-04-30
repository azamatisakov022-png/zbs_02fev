package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Организация-автор публикации. Хранится явно (а не выводится из роли
 * редактора), чтобы:
 *   1. Гражданин видел «откуда новость» на детальной странице.
 *   2. Админ мог опубликовать что-то под любой организацией.
 *
 * Tabs-фильтрации по организациям на публичной странице НЕТ —
 * лента общая, без деления (Q1=C из обсуждения 28.04.2026).
 */
public enum PublicationAuthorOrg {
    MPRETN("MPRETN"),
    ECO_OPERATOR("ECO_OPERATOR"),
    ADMIN_GENERIC("ADMIN_GENERIC");

    private final String value;

    PublicationAuthorOrg(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PublicationAuthorOrg fromValue(String value) {
        for (PublicationAuthorOrg a : values()) {
            if (a.value.equalsIgnoreCase(value)) return a;
        }
        throw new IllegalArgumentException("Unknown author org: " + value);
    }
}
