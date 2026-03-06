package kg.eco.operator.integration.customs.rest;

import kg.eco.operator.integration.common.IntegrationException;
import kg.eco.operator.integration.customs.CustomsServicePort;
import kg.eco.operator.integration.customs.dto.CustomsDeclarationRequest;
import kg.eco.operator.integration.customs.dto.CustomsDeclarationResponse;
import kg.eco.operator.integration.customs.dto.CustomsVolumeVerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Service
@Profile("production")
@RequiredArgsConstructor
public class RestCustomsServiceAdapter implements CustomsServicePort {

    private final RestClient customsServiceClient;

    @Override
    public List<CustomsDeclarationResponse> getImportDeclarations(CustomsDeclarationRequest request) {
        log.info("Запрос ГТД из ГТС КР: ИНН={}", request.getCompanyInn());
        try {
            return customsServiceClient.post()
                    .uri("/declarations/search")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (Exception e) {
            throw new IntegrationException("ГТС КР", "getImportDeclarations", e);
        }
    }

    @Override
    public CustomsVolumeVerificationResponse verifyDeclaredVolumes(
            String companyInn, int year, int quarter) {
        log.info("Сверка объёмов с ГТС КР: ИНН={}, год={}, квартал={}", companyInn, year, quarter);
        try {
            return customsServiceClient.get()
                    .uri("/volumes/verify?inn={inn}&year={year}&quarter={quarter}",
                            companyInn, year, quarter)
                    .retrieve()
                    .body(CustomsVolumeVerificationResponse.class);
        } catch (Exception e) {
            throw new IntegrationException("ГТС КР", "verifyDeclaredVolumes", e);
        }
    }
}
