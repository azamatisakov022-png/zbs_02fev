package kg.eco.operator.dto.response;

import java.math.BigDecimal;

public record ProductGroupSummaryResponse(
        Long id,
        Integer groupNumber,
        String name,
        String code,
        String type,
        String unit,
        String sectionLetter,
        String sectionName,
        BigDecimal currentRate,
        int subgroupCount
) {}
