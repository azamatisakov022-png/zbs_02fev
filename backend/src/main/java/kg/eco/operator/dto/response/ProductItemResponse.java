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
public class ProductItemResponse {

    private Long id;
    private String productGroup;
    private String productSubgroup;
    private String tnvedCode;
    private String gskpCode;
    private String productName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal weight;
    private BigDecimal rate;
    private BigDecimal amount;
    private BigDecimal recyclingNorm;
}
