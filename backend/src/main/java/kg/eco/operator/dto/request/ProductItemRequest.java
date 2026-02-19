package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductItemRequest {

    @NotBlank(message = "Группа продукции обязательна")
    private String productGroup;

    private String productSubgroup;

    private String tnvedCode;

    private String gskpCode;

    private String productName;

    @NotNull(message = "Количество обязательно")
    @Positive(message = "Количество должно быть положительным")
    private BigDecimal quantity;

    private String unit;

    @NotNull(message = "Масса обязательна")
    @Positive(message = "Масса должна быть положительной")
    private BigDecimal weight;

    @NotNull(message = "Ставка обязательна")
    @Positive(message = "Ставка должна быть положительной")
    private BigDecimal rate;

    private BigDecimal recyclingNorm;
}
