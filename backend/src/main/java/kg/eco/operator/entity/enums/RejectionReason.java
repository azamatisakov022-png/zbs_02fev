package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Основания отказа в выдаче лицензии — закрытый перечень из 5 пунктов
 * согласно ст. 14 Закона КР № 195 от 19.10.2023.
 *
 * В UI сотрудника — только селектор, свободный текст причины не разрешён.
 * Опциональное уточнение хранится в license_applications.rejection_comment.
 */
public enum RejectionReason {
    LEGAL_PROHIBITION("legal_prohibition"),
    COURT_DECISION("court_decision"),
    INVALID_INFO("invalid_info"),
    DOCUMENTS_MISMATCH("documents_mismatch"),
    FEE_NOT_PAID("fee_not_paid");

    private final String value;

    RejectionReason(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RejectionReason fromValue(String value) {
        for (RejectionReason s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown RejectionReason: " + value);
    }

    /**
     * Можно ли устранить причину отказа и повторно подать заявку.
     * LEGAL_PROHIBITION и COURT_DECISION — неустранимые.
     */
    public boolean isFixable() {
        return this == INVALID_INFO
            || this == DOCUMENTS_MISMATCH
            || this == FEE_NOT_PAID;
    }
}
