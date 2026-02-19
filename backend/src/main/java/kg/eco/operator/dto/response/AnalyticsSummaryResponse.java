package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryResponse {

    private long totalPayers;
    private long activePayers;
    private BigDecimal totalCharged;
    private BigDecimal totalCollected;
    private BigDecimal collectionRate;
    private BigDecimal totalRecycled;
    private BigDecimal recyclingRate;
    private long pendingCalculations;
    private long pendingDeclarations;
}
