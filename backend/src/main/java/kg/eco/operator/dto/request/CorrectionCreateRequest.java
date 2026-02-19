package kg.eco.operator.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CorrectionCreateRequest {

    private List<CorrectionItemRequest> items;
    private String comment;

    @Data
    public static class CorrectionItemRequest {
        private Long calculationId;
        private java.math.BigDecimal originalAmount;
        private java.math.BigDecimal correctedAmount;
        private String reason;
    }
}
