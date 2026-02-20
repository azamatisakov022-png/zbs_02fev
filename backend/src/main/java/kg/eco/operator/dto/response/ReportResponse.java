package kg.eco.operator.dto.response;

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
public class ReportResponse {

    private Long id;
    private String number;
    private String period;
    private String status;
    private String submitterInn;
    private String recyclerName;
    private Long recyclerId;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ReportItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportItemResponse {
        private Long id;
        private String wasteGroup;
        private String wasteCode;
        private BigDecimal volumeReceived;
        private BigDecimal volumeProcessed;
        private BigDecimal recyclingPercent;
        private BigDecimal recyclingNorm;
        private String technology;
    }
}
