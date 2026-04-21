package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Отправка заявки на рассмотрение. Определяет режим оплаты:
 *   - "online" — будет возвращён paymentUrl, заявка перейдёт в PAYMENT_PENDING.
 *   - "offline" — заявка сразу в SUBMITTED, оплата подтверждается сотрудником
 *     после проверки приложенной квитанции (отдельно через /manual-payment).
 */
@Data
public class SubmitLicenseApplicationRequest {

    @NotBlank
    private String paymentMode; // "online" | "offline"

    /** Для онлайн-оплаты — URL возврата после шлюза. */
    private String returnUrl;
}
