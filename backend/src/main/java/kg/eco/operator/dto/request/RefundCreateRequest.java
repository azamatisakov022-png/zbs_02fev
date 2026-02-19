package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RefundCreateRequest {

    @NotEmpty
    private List<RefundItemRequest> items;

    private String comment;

    @Data
    public static class RefundItemRequest {
        @NotNull
        private Long calculationId;

        @NotNull
        @Positive
        private BigDecimal amount;

        @NotNull
        private String reason;
    }
}
