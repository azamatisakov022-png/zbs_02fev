package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EmployeeDashboardResponse extends DashboardResponse {

    private AnalyticsSummaryResponse analytics;
    private PayerStatsResponse payerStats;
    private AccountSummaryResponse accountSummary;
    private long pendingCorrections;
}
