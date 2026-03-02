package kg.eco.operator.integration.taxservice.stub;

import kg.eco.operator.integration.taxservice.TaxServicePort;
import kg.eco.operator.integration.taxservice.dto.TaxCompanyRegistrationResponse;
import kg.eco.operator.integration.taxservice.dto.TaxInnVerificationResponse;
import kg.eco.operator.integration.taxservice.dto.TaxReportSubmissionRequest;
import kg.eco.operator.integration.taxservice.dto.TaxReportSubmissionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Stub implementation of ГНС КР integration for dev/staging/demo.
 * Returns realistic Kyrgyz company data for known test INNs.
 */
@Slf4j
@Service
@Profile("!production")
public class StubTaxServiceAdapter implements TaxServicePort {

    // Known test companies (from V5__seed_test_users.sql)
    private static final Map<String, StubCompany> KNOWN_COMPANIES = Map.of(
            "02312200210134", new StubCompany("ОсОО \"Бишкек Трейд\"", "ОсОО", "active",
                    LocalDate.of(2019, 3, 15), "general",
                    "г. Бишкек, ул. Киевская 120, оф. 5", "Исаков А.Т.", "Директор",
                    "12345", List.of("46.90", "47.19"), "+996 555 101010", "trade@bishkek-trade.kg"),
            "01234500010001", new StubCompany("ГП \"Эко Оператор\"", "ГП", "active",
                    LocalDate.of(2024, 1, 10), "general",
                    "г. Бишкек, ул. Токтогула 28", "Сатаров Б.К.", "Генеральный директор",
                    "67890", List.of("38.11", "38.21"), "+996 312 900100", "info@eco-operator.kg"),
            "00100100010001", new StubCompany("МПРЭТН КР", "ГО", "active",
                    LocalDate.of(2020, 6, 1), "budget",
                    "г. Бишкек, ул. Тоголок Молдо 2", "Турдубаев М.А.", "Министр",
                    "11111", List.of("84.11"), "+996 312 541200", "info@mpretn.gov.kg")
    );

    @Override
    public TaxInnVerificationResponse verifyInn(String inn) {
        log.info("[STUB ГНС] Проверка ИНН: {}", inn);

        // Known test INN
        StubCompany known = KNOWN_COMPANIES.get(inn);
        if (known != null) {
            return TaxInnVerificationResponse.builder()
                    .valid(true)
                    .inn(inn)
                    .officialName(known.name)
                    .legalForm(known.legalForm)
                    .status(known.status)
                    .registrationDate(known.registrationDate)
                    .taxRegime(known.taxRegime)
                    .build();
        }

        // Any valid 14-digit INN returns valid
        if (inn != null && inn.matches("\\d{14}")) {
            return TaxInnVerificationResponse.builder()
                    .valid(true)
                    .inn(inn)
                    .officialName("ОсОО «Компания " + inn.substring(0, 4) + "»")
                    .legalForm("ОсОО")
                    .status("active")
                    .registrationDate(LocalDate.now().minusYears(2))
                    .taxRegime("general")
                    .build();
        }

        return TaxInnVerificationResponse.builder()
                .valid(false)
                .inn(inn)
                .errorMessage("ИНН не найден в реестре ГНС КР")
                .build();
    }

    @Override
    public TaxCompanyRegistrationResponse getCompanyRegistration(String inn) {
        log.info("[STUB ГНС] Запрос регистрационных данных: {}", inn);

        StubCompany known = KNOWN_COMPANIES.get(inn);
        if (known != null) {
            return TaxCompanyRegistrationResponse.builder()
                    .inn(inn)
                    .officialName(known.name)
                    .legalForm(known.legalForm)
                    .legalAddress(known.address)
                    .actualAddress(known.address)
                    .director(known.director)
                    .directorPosition(known.directorPosition)
                    .okpoCode(known.okpoCode)
                    .okedCodes(known.okedCodes)
                    .phone(known.phone)
                    .email(known.email)
                    .registrationDate(known.registrationDate)
                    .status(known.status)
                    .build();
        }

        // Generic response for unknown but valid INNs
        return TaxCompanyRegistrationResponse.builder()
                .inn(inn)
                .officialName("ОсОО «Компания " + inn.substring(0, 4) + "»")
                .legalForm("ОсОО")
                .legalAddress("г. Бишкек")
                .director("Иванов И.И.")
                .directorPosition("Директор")
                .registrationDate(LocalDate.now().minusYears(2))
                .status("active")
                .build();
    }

    @Override
    public TaxReportSubmissionResponse submitUtilizationFeeReport(TaxReportSubmissionRequest request) {
        log.info("[STUB ГНС] Отправка отчёта по утилизационному сбору: ИНН={}, сумма={}",
                request.getCompanyInn(), request.getTotalAmount());

        return TaxReportSubmissionResponse.builder()
                .accepted(true)
                .referenceNumber("GNS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .submittedAt(LocalDateTime.now())
                .build();
    }

    private record StubCompany(
            String name, String legalForm, String status, LocalDate registrationDate,
            String taxRegime, String address, String director, String directorPosition,
            String okpoCode, List<String> okedCodes, String phone, String email
    ) {}
}
