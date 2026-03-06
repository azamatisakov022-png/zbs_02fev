package kg.eco.operator.integration.banking.rest;

import kg.eco.operator.integration.banking.BankingServicePort;
import kg.eco.operator.integration.banking.dto.*;
import kg.eco.operator.integration.common.IntegrationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@Profile("production")
@RequiredArgsConstructor
public class RestBankingServiceAdapter implements BankingServicePort {

    private final RestClient bankingClient;

    @Override
    public BankPaymentVerificationResponse verifyPayment(BankPaymentVerificationRequest request) {
        log.info("Проверка платежа в банке: {}", request.getPaymentOrderNumber());
        try {
            return bankingClient.post()
                    .uri("/payments/verify")
                    .body(request)
                    .retrieve()
                    .body(BankPaymentVerificationResponse.class);
        } catch (Exception e) {
            throw new IntegrationException("Банк", "verifyPayment", e);
        }
    }

    @Override
    public BankStatementResponse getAccountStatement(BankStatementRequest request) {
        log.info("Запрос выписки из банка: счёт={}", request.getAccountNumber());
        try {
            return bankingClient.post()
                    .uri("/statements")
                    .body(request)
                    .retrieve()
                    .body(BankStatementResponse.class);
        } catch (Exception e) {
            throw new IntegrationException("Банк", "getAccountStatement", e);
        }
    }

    @Override
    public BankPaymentVerificationResponse checkPaymentStatus(String trackingId) {
        log.info("Проверка статуса платежа в банке: {}", trackingId);
        try {
            return bankingClient.get()
                    .uri("/payments/status/{id}", trackingId)
                    .retrieve()
                    .body(BankPaymentVerificationResponse.class);
        } catch (Exception e) {
            throw new IntegrationException("Банк", "checkPaymentStatus", e);
        }
    }
}
