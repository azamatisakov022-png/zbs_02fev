package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kg.eco.operator.entity.enums.ApplicantEntity;
import kg.eco.operator.entity.enums.ApplicantType;
import kg.eco.operator.entity.enums.LicenseType;
import lombok.Data;

import java.util.List;

/**
 * Создание или обновление черновика заявки на лицензию (DRAFT).
 * Используется для POST /api/license-applications и
 * PUT /api/license-applications/{id} (только для DRAFT).
 */
@Data
public class CreateLicenseApplicationRequest {

    @NotNull
    private ApplicantType applicantType;

    /** null для applicantType=OTHER. */
    private Long applicantId;

    @NotNull
    private ApplicantEntity applicantEntity;

    @NotBlank
    @Size(max = 255)
    private String applicantName;

    @NotBlank
    @Size(min = 12, max = 14)
    private String applicantInn;

    @NotNull
    private LicenseType licenseType;

    @NotEmpty
    private List<String> activityTypes;

    @NotBlank
    private String legalAddress;

    @NotBlank
    private String actualAddress;

    @Size(max = 30)
    private String contactPhone;

    @Size(max = 100)
    private String contactEmail;

    @Size(max = 100)
    private String contactPerson;
}
