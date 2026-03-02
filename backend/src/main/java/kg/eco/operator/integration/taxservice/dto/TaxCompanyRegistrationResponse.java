package kg.eco.operator.integration.taxservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class TaxCompanyRegistrationResponse {
    private String inn;
    private String officialName;
    private String legalForm;
    private String legalAddress;
    private String actualAddress;
    private String director;
    private String directorPosition;
    private String okpoCode;
    private List<String> okedCodes;
    private String phone;
    private String email;
    private LocalDate registrationDate;
    private String status;
}
