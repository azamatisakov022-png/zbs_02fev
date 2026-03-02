package kg.eco.operator.integration.taxservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TaxInnVerificationResponse {
    private boolean valid;
    private String inn;
    private String officialName;
    private String legalForm;
    private String status;              // "active", "liquidated", "suspended"
    private LocalDate registrationDate;
    private String taxRegime;
    private String errorMessage;
}
