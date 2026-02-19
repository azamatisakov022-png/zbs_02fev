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
public class RegionDataResponse {

    private String region;
    private long payersCount;
    private long recyclersCount;
    private long landfillsCount;
    private long dumpsCount;
    private BigDecimal totalWaste;
    private BigDecimal totalRecycled;
}
