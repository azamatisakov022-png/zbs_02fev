package kg.eco.operator.integration.taxservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TaxReportSubmissionResponse {
    private boolean accepted;
    private String referenceNumber;
    private LocalDateTime submittedAt;
    private String errorMessage;
}
