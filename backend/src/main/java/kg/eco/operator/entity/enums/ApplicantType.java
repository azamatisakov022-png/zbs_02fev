package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Тип субъекта обращения с отходами в заявке на лицензию.
 * Определяет, из какой таблицы подтягивать организацию в форме подачи.
 *   RECYCLER         — из таблицы recyclers
 *   LANDFILL         — из таблицы landfills
 *   COLLECTION_POINT — из таблицы collection_points
 *   OTHER            — иная организация, не входящая в три реестра (applicant_id=NULL,
 *                      название и ИНН вводятся вручную)
 */
public enum ApplicantType {
    RECYCLER("recycler"),
    LANDFILL("landfill"),
    COLLECTION_POINT("collection_point"),
    OTHER("other");

    private final String value;

    ApplicantType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ApplicantType fromValue(String value) {
        for (ApplicantType s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown ApplicantType: " + value);
    }
}
