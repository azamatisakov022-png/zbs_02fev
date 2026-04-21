package kg.eco.operator.service.payment;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Результат создания платёжного намерения у провайдера.
 * Возвращается из {@link PaymentProvider#createIntent}.
 * Фронт использует {@code paymentUrl} для редиректа в платёжный шлюз.
 */
@Value
@Builder
public class PaymentIntent {
    /** URL шлюза, куда редиректить пользователя. */
    String paymentUrl;

    /** ID заказа у провайдера. Сохраняется в payments.provider_order_id. */
    String providerOrderId;

    /** Момент, после которого намерение перестаёт быть валидным. */
    LocalDateTime expiresAt;
}
