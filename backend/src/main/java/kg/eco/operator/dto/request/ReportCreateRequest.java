package kg.eco.operator.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ReportCreateRequest {
    private String company;
    private String inn;
    private String year;
    private List<ReportItemRequest> items;

    @Data
    public static class ReportItemRequest {
        private String wasteType;
        private String wasteCode;
        private String declared;
        private String processed;
        private String recycler;
        private String contractNumber;
        private String contractDate;
    }
}
