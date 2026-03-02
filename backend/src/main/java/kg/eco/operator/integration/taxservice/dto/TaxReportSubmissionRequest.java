package kg.eco.operator.integration.taxservice.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class TaxReportSubmissionRequest {
    private String companyInn;
    private String period;
    private int year;
    private int quarter;
    private BigDecimal totalAmount;
    private String calculationNumber;
    private List<TaxReportItem> items;

    @Data
    @Builder
    public static class TaxReportItem {
        private String productGroup;
        private String tnvedCode;
        private BigDecimal weight;
        private BigDecimal rate;
        private BigDecimal amount;
    }
}
