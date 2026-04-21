package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Статус платежа для polling'а на thank-you странице после возврата из шлюза.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentStatusResponse {

    private Long paymentId;
    private Long applicationId;
    private String applicationStatus;
    private String status;             // PENDING|SUCCESS|FAILED|EXPIRED|MANUAL_CONFIRMED
    private String provider;
    private BigDecimal amount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paidAt;

    private String receiptUrl;
    private String errorMessage;
}
