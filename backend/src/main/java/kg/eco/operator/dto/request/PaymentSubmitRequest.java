package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentSubmitRequest {

    @NotNull(message = "Сумма платежа обязательна")
    @Positive(message = "Сумма должна быть положительной")
    private BigDecimal amount;

    @NotNull(message = "Дата платежа обязательна")
    private LocalDate paymentDate;
}
