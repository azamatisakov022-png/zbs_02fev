package kg.eco.operator.integration.taxservice.rest;

import kg.eco.operator.integration.common.IntegrationException;
import kg.eco.operator.integration.taxservice.TaxServicePort;
import kg.eco.operator.integration.taxservice.dto.TaxCompanyRegistrationResponse;
import kg.eco.operator.integration.taxservice.dto.TaxInnVerificationResponse;
import kg.eco.operator.integration.taxservice.dto.TaxReportSubmissionRequest;
import kg.eco.operator.integration.taxservice.dto.TaxReportSubmissionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Real implementation of ГНС КР integration.
 * Activated only with production profile when the real API is available.
 */
@Slf4j
@Service
@Profile("production")
@RequiredArgsConstructor
public class RestTaxServiceAdapter implements TaxServicePort {

    private final RestClient taxServiceClient;

    @Override
    public TaxInnVerificationResponse verifyInn(String inn) {
        log.info("Проверка ИНН в ГНС КР: {}", inn);
        try {
            return taxServiceClient.get()
                    .uri("/inn/{inn}/verify", inn)
                    .retrieve()
                    .body(TaxInnVerificationResponse.class);
        } catch (Exception e) {
            throw new IntegrationException("ГНС КР", "verifyInn", e);
        }
    }

    @Override
    public TaxCompanyRegistrationResponse getCompanyRegistration(String inn) {
        log.info("Запрос регистрационных данных из ГНС КР: {}", inn);
        try {
            return taxServiceClient.get()
                    .uri("/inn/{inn}/registration", inn)
                    .retrieve()
                    .body(TaxCompanyRegistrationResponse.class);
        } catch (Exception e) {
            throw new IntegrationException("ГНС КР", "getCompanyRegistration", e);
        }
    }

    @Override
    public TaxReportSubmissionResponse submitUtilizationFeeReport(TaxReportSubmissionRequest request) {
        log.info("Отправка отчёта в ГНС КР: ИНН={}", request.getCompanyInn());
        try {
            return taxServiceClient.post()
                    .uri("/reports/utilization-fee")
                    .body(request)
                    .retrieve()
                    .body(TaxReportSubmissionResponse.class);
        } catch (Exception e) {
            throw new IntegrationException("ГНС КР", "submitUtilizationFeeReport", e);
        }
    }
}
