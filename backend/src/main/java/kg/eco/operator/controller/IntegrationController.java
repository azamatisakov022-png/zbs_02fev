package kg.eco.operator.controller;

import kg.eco.operator.dto.response.CompanyLookupResponse;
import kg.eco.operator.integration.taxservice.TaxServicePort;
import kg.eco.operator.integration.taxservice.dto.TaxCompanyRegistrationResponse;
import kg.eco.operator.integration.taxservice.dto.TaxInnVerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/integrations")
@RequiredArgsConstructor
public class IntegrationController {

    private final TaxServicePort taxServicePort;

    @GetMapping("/company-info")
    public ResponseEntity<CompanyLookupResponse> getCompanyInfo(
            @RequestParam String inn) {

        log.info("Запрос данных компании по ИНН: {}", inn);

        if (inn == null || inn.trim().length() != 14 || !inn.trim().matches("\\d+")) {
            return ResponseEntity.badRequest().body(
                CompanyLookupResponse.builder()
                    .found(false)
                    .active(false)
                    .errorMessage("ИНН должен содержать 14 цифр")
                    .build()
            );
        }

        String cleanInn = inn.trim();

        TaxInnVerificationResponse verification = taxServicePort.verifyInn(cleanInn);

        if (!verification.isValid()) {
            return ResponseEntity.ok(
                CompanyLookupResponse.builder()
                    .found(false)
                    .active(false)
                    .inn(cleanInn)
                    .errorMessage("ИНН не найден в реестре ГНС")
                    .build()
            );
        }

        if ("liquidated".equals(verification.getStatus())) {
            return ResponseEntity.ok(
                CompanyLookupResponse.builder()
                    .found(true)
                    .active(false)
                    .inn(cleanInn)
                    .officialName(verification.getOfficialName())
                    .legalForm(verification.getLegalForm())
                    .status(verification.getStatus())
                    .errorMessage("Организация ликвидирована. Регистрация невозможна.")
                    .build()
            );
        }

        TaxCompanyRegistrationResponse details =
            taxServicePort.getCompanyRegistration(cleanInn);

        return ResponseEntity.ok(
            CompanyLookupResponse.builder()
                .found(true)
                .active(true)
                .inn(details.getInn())
                .officialName(details.getOfficialName())
                .legalForm(details.getLegalForm())
                .legalAddress(details.getLegalAddress())
                .actualAddress(details.getActualAddress())
                .director(details.getDirector())
                .directorPosition(details.getDirectorPosition())
                .okpoCode(details.getOkpoCode())
                .okedCodes(details.getOkedCodes())
                .phone(details.getPhone())
                .email(details.getEmail())
                .registrationDate(details.getRegistrationDate())
                .status(details.getStatus())
                .taxRegime(verification.getTaxRegime())
                .build()
        );
    }
}
