package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Категории публикаций АИС «Эко Оператор».
 *
 * Объединили близкие смыслы для упрощения:
 *   - REPORT_ANALYTICS объединяет «отчёты» и «аналитику»
 *   - NEWS включает «новости» и «объявления»
 *
 * Категория «Законодательство» НЕ включена — она дублирует
 * раздел «Нормативная база», доступный отдельно.
 */
public enum PublicationCategory {
    NEWS("news"),
    CONTEST("contest"),
    REPORT_ANALYTICS("report_analytics"),
    PRESS("press");

    private final String value;

    PublicationCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PublicationCategory fromValue(String value) {
        for (PublicationCategory c : values()) {
            if (c.value.equalsIgnoreCase(value)) return c;
        }
        throw new IllegalArgumentException("Unknown publication category: " + value);
    }
}
