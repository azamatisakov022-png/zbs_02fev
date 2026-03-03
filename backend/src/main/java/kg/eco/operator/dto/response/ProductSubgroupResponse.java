package kg.eco.operator.dto.response;

import java.math.BigDecimal;

public record ProductSubgroupResponse(
        Long id,
        String name,
        String gskpCode,
        String tnvedCode,
        String tnvedName,
        String type,
        BigDecimal rateMultiplier,
        String packagingMaterial,
        String packagingLetterCode,
        String packagingDigitalCode,
        Integer sortOrder
) {}
