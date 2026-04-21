package kg.eco.operator.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.EnumSet;
import java.util.Set;

/**
 * Типы документов заявки на лицензию.
 *
 * Базовые (обязательны для всех видов лицензий):
 *   APPLICATION_FORM, REGISTRATION_CERT, PAYMENT_RECEIPT
 *
 * Расширенные (обязательны только для PROCESSING, NEUTRALIZATION,
 * STORAGE_DISPOSAL, COMPLEX согласно Постановлению № 678 гл. 64 п. 396):
 *   WASTE_OBJECT_OWNERSHIP, ECO_EXPERTISE_REPORT, ECO_JUSTIFICATION,
 *   SECURITY_ORDER, SANITARY_FIRE_APPROVAL, QUALITY_CONTROL_INFO,
 *   MEASURING_EQUIPMENT_LIST, METROLOGY_CERTIFICATES, PERSONNEL_INFO
 */
public enum LicenseDocumentType {
    // ─── базовые ───
    APPLICATION_FORM("application_form"),
    REGISTRATION_CERT("registration_cert"),
    PAYMENT_RECEIPT("payment_receipt"),

    // ─── расширенные (Постановление № 678, гл. 64, п. 396) ───
    WASTE_OBJECT_OWNERSHIP("waste_object_ownership"),
    ECO_EXPERTISE_REPORT("eco_expertise_report"),
    ECO_JUSTIFICATION("eco_justification"),
    SECURITY_ORDER("security_order"),
    SANITARY_FIRE_APPROVAL("sanitary_fire_approval"),
    QUALITY_CONTROL_INFO("quality_control_info"),
    MEASURING_EQUIPMENT_LIST("measuring_equipment_list"),
    METROLOGY_CERTIFICATES("metrology_certificates"),
    PERSONNEL_INFO("personnel_info");

    private final String value;

    LicenseDocumentType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static LicenseDocumentType fromValue(String value) {
        for (LicenseDocumentType s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown LicenseDocumentType: " + value);
    }

    public static final Set<LicenseDocumentType> BASE_REQUIRED =
            EnumSet.of(APPLICATION_FORM, REGISTRATION_CERT);

    public static final Set<LicenseDocumentType> EXTENDED_REQUIRED =
            EnumSet.of(WASTE_OBJECT_OWNERSHIP, ECO_EXPERTISE_REPORT, ECO_JUSTIFICATION,
                    SECURITY_ORDER, SANITARY_FIRE_APPROVAL, QUALITY_CONTROL_INFO,
                    MEASURING_EQUIPMENT_LIST, METROLOGY_CERTIFICATES, PERSONNEL_INFO);

    /**
     * Обязательные документы для конкретного вида лицензии.
     * Для PROCESSING, NEUTRALIZATION, STORAGE_DISPOSAL, COMPLEX добавляются расширенные.
     * PAYMENT_RECEIPT в обязательном списке НЕТ — он нужен только при офлайн-оплате.
     */
    public static Set<LicenseDocumentType> requiredFor(LicenseType licenseType) {
        EnumSet<LicenseDocumentType> required = EnumSet.copyOf(BASE_REQUIRED);
        if (licenseType != null && licenseType.requiresExtendedDocuments()) {
            required.addAll(EXTENDED_REQUIRED);
        }
        return required;
    }
}
