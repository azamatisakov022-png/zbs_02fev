package kg.eco.operator.integration.customs.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CustomsImportItem {
    private String tnvedCode;
    private String productDescription;
    private BigDecimal weightKg;
    private BigDecimal weightNet;
    private BigDecimal customsValue;
    private String unit;
    private BigDecimal quantity;
    private String productGroupMapping;
}
