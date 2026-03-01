package kg.eco.operator.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CorrectionCreateRequest {

    @NotEmpty(message = "Необходимо указать хотя бы одну позицию корректировки")
    @Valid
    private List<CorrectionItemRequest> items;

    @Size(max = 2000)
    private String comment;

    @Data
    public static class CorrectionItemRequest {
        @NotNull(message = "ID расчёта обязателен")
        private Long calculationId;

        @NotNull(message = "Исходная сумма обязательна")
        @Positive
        private BigDecimal originalAmount;

        @NotNull(message = "Скорректированная сумма обязательна")
        @Positive
        private BigDecimal correctedAmount;

        @Size(max = 1000)
        private String reason;
    }
}
