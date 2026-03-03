package kg.eco.operator.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductGroupDetailResponse(
        Long id,
        Integer groupNumber,
        String name,
        String code,
        String type,
        String unit,
        String sectionLetter,
        String sectionName,
        BigDecimal currentRate,
        List<ProductSubgroupResponse> subgroups,
        List<ProductGroupNormResponse> norms,
        ProductGroupRateResponse currentRateDetails
) {}
