package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Статусы заявки на выдачу лицензии.
 * State machine:
 *   DRAFT ──submit(online)──▶ PAYMENT_PENDING ──webhook(success)──▶ SUBMITTED
 *                                             ──webhook(failed/timeout)──▶ DRAFT
 *   DRAFT ──submit(offline)──▶ SUBMITTED (payment.status=MANUAL_CONFIRMED=false)
 *   SUBMITTED ──accept()──▶ UNDER_REVIEW ──site_visit()──▶ SITE_VISIT_DONE
 *                                                      ──approve()──▶ APPROVED
 *                                                      ──reject()───▶ REJECTED
 *   SUBMITTED / UNDER_REVIEW ──reject()──▶ REJECTED
 *   REJECTED ──reopen()──▶ DRAFT (повторная подача без новой оплаты)
 */
public enum LicenseApplicationStatus {
    DRAFT("draft"),
    PAYMENT_PENDING("payment_pending"),
    SUBMITTED("submitted"),
    UNDER_REVIEW("under_review"),
    SITE_VISIT_DONE("site_visit_done"),
    APPROVED("approved"),
    REJECTED("rejected");

    private final String value;

    LicenseApplicationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LicenseApplicationStatus fromValue(String value) {
        for (LicenseApplicationStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown LicenseApplicationStatus: " + value);
    }

    public boolean isTerminal() {
        return this == APPROVED;
    }

    public boolean canBeReopened() {
        return this == REJECTED;
    }

    public boolean isActiveForReview() {
        return this == SUBMITTED || this == UNDER_REVIEW || this == SITE_VISIT_DONE;
    }
}
