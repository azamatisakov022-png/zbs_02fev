package kg.eco.operator.service.payment;

import kg.eco.operator.entity.LicenseApplication;
import kg.eco.operator.entity.LicensePayment;

import java.math.BigDecimal;

/**
 * Абстрактный интерфейс платёжного провайдера.
 *
 * Реализации:
 *   - MockPaymentProvider — для локальной разработки и интеграционных тестов.
 *   - EldikPaymentProvider — после договора с Элдик Банком (TBD).
 *   - GnsPaymentProvider   — если пойдём через Единый платёжный шлюз ГНС (TBD).
 *   - AggregatorPaymentProvider — для внешнего агрегатора (FreedomPay, O!Pay, …).
 *
 * Активный провайдер выбирается через system_settings.license_payment_provider_active
 * и резолвится фабрикой PaymentProviderFactory.
 */
public interface PaymentProvider {

    /**
     * Код провайдера, совпадает со значением в system_settings.license_payment_provider_active
     * и с полем license_payments.provider.
     */
    String code();

    /**
     * Создаёт платёжное намерение у провайдера.
     *
     * @param application  заявка, по которой создаётся платёж
     * @param amount       сумма госпошлины
     * @param returnUrl    URL, на который вернуть пользователя после оплаты (success / failure)
     * @return намерение с URL шлюза для редиректа и идентификатором заказа у провайдера
     */
    PaymentIntent createIntent(LicenseApplication application, BigDecimal amount, String returnUrl);

    /**
     * Проверка HMAC-подписи webhook'а. Реализуется каждым провайдером по-своему
     * (разные алгоритмы, разные заголовки).
     *
     * @param rawBody     сырой body запроса (байт в байт, как пришёл)
     * @param signature   значение заголовка подписи
     * @return true, если подпись валидна
     */
    boolean verifySignature(String rawBody, String signature);

    /**
     * Разбор payload webhook'а в унифицированное событие.
     * Если формат неизвестен или данные повреждены — возвращает UNKNOWN.
     */
    WebhookEvent parseWebhook(String rawBody);

    /**
     * Запрос актуального статуса платежа у провайдера (fallback на случай потери webhook'а).
     * Используется для reconciliation-джобы и polling'а на странице "Спасибо".
     */
    PaymentStatus fetchStatus(LicensePayment payment);
}
