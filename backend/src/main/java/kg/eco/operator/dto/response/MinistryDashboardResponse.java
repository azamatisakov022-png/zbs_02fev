package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MinistryDashboardResponse extends DashboardResponse {

    private AnalyticsSummaryResponse analytics;
    private List<RegionDataResponse> regions;
}
