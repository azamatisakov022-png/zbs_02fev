package kg.eco.operator.dto.response;

import java.math.BigDecimal;

public record ProductGroupNormResponse(
        Integer year,
        BigDecimal normPercent,
        String resolutionNumber
) {}
