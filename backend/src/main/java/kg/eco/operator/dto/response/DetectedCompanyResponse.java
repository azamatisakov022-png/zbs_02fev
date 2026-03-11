package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectedCompanyResponse {
    private Long id;
    private String inn;
    private String companyName;
    private String legalForm;
    private String legalAddress;
    private String director;
    private String phone;
    private String email;
    private String okpoCode;
    private String okedCodes;
    private String source;
    private String status;
    private String tnvedCodes;
    private BigDecimal estimatedMass;
    private String gnsStatus;
    private String assignedEmployeeName;
    private LocalDateTime notifiedAt;
    private String notes;
    private LocalDateTime createdAt;
}
