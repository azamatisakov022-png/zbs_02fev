package kg.eco.operator.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductGroupRateResponse(
        Long id,
        BigDecimal ratePerTon,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        String resolutionNumber
) {}
