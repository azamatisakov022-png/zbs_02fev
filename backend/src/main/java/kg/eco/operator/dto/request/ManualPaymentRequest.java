package kg.eco.operator.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Подтверждение офлайн-оплаты госпошлины.
 * Заявитель прикладывает скан квитанции, указывает сумму и дату оплаты.
 * Сотрудник МПРЭТН затем подтверждает платёж через /api/admin/license-payments/{id}/confirm-manual.
 */
@Data
public class ManualPaymentRequest {

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paidAt;
}
