package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Виды лицензий в сфере обращения с отходами.
 * Источник: Закон КР № 195 от 19.10.2023 (ст. 14) и Постановление КМ КР № 678 (гл. 64).
 *
 * Для PROCESSING, NEUTRALIZATION, STORAGE_DISPOSAL, COMPLEX требуются
 * дополнительные документы согласно Постановлению № 678 (гл. 64 п. 396).
 */
public enum LicenseType {
    COLLECTION("collection"),             // Сбор
    TRANSPORTATION("transportation"),     // Транспортировка
    PROCESSING("processing"),             // Обработка (переработка)
    NEUTRALIZATION("neutralization"),     // Обезвреживание (уничтожение)
    STORAGE_DISPOSAL("storage_disposal"), // Хранение (захоронение)
    COMPLEX("complex");                   // Комплексная

    private final String value;

    LicenseType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LicenseType fromValue(String value) {
        for (LicenseType s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown LicenseType: " + value);
    }

    /**
     * Требует ли данный вид лицензии расширенного пакета документов
     * (девяти дополнительных по Постановлению № 678 гл. 64 п. 396).
     */
    public boolean requiresExtendedDocuments() {
        return this == PROCESSING
            || this == NEUTRALIZATION
            || this == STORAGE_DISPOSAL
            || this == COMPLEX;
    }
}
