package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeclarationResponse {

    private Long id;
    private String number;
    private Long companyId;
    private String companyName;
    private String companyInn;
    private Integer year;
    private List<DeclarationCalcItemResponse> calculations;
    private List<DeclarationReportItemResponse> reports;
    private DeclarationPaymentResponse payment;
    private List<DeclarationDocumentResponse> documents;
    private List<HistoryEntryResponse> history;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submittedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeclarationCalcItemResponse {
        private Long calculationId;
        private String number;
        private String period;
        private BigDecimal amount;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeclarationReportItemResponse {
        private Long reportId;
        private String recyclerName;
        private String period;
        private BigDecimal volume;
        private BigDecimal offsetAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeclarationPaymentResponse {
        private BigDecimal totalCharged;
        private BigDecimal totalPaid;
        private BigDecimal totalOffset;
        private BigDecimal balance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeclarationDocumentResponse {
        private Long id;
        private String name;
        private String type;
        private String url;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryEntryResponse {
        private Long id;
        private String action;
        private String user;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime date;

        private String comment;
    }
}
