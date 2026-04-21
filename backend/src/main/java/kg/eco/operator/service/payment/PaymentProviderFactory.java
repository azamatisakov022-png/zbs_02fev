package kg.eco.operator.service.payment;

import kg.eco.operator.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Фабрика провайдеров платежей. Резолвит активный провайдер по настройке
 * system_settings.payment_provider_active.
 *
 * Использование:
 *   PaymentProvider provider = providerFactory.getActive();
 *   PaymentIntent intent = provider.createIntent(...);
 *
 * Для webhook — резолвим по пути /api/payments/webhook/{provider}:
 *   PaymentProvider provider = providerFactory.byCode(providerCode);
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentProviderFactory {

    private static final String SETTING_KEY = "payment_provider_active";
    private static final String DEFAULT_PROVIDER = MockPaymentProvider.CODE;

    private final List<PaymentProvider> providers;
    private final SystemSettingsService systemSettings;

    private Map<String, PaymentProvider> byCode;

    public PaymentProvider getActive() {
        String code = systemSettings.get(SETTING_KEY, DEFAULT_PROVIDER);
        return byCode(code);
    }

    public PaymentProvider byCode(String code) {
        if (byCode == null) {
            byCode = providers.stream()
                    .collect(Collectors.toMap(PaymentProvider::code, p -> p));
            log.info("Registered payment providers: {}", byCode.keySet());
        }
        PaymentProvider provider = byCode.get(code);
        if (provider == null) {
            throw new IllegalStateException("Unknown payment provider: " + code
                    + ". Available: " + byCode.keySet());
        }
        return provider;
    }
}
