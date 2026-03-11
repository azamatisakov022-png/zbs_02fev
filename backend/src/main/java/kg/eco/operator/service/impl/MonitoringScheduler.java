package kg.eco.operator.service.impl;

import kg.eco.operator.entity.DetectedCompany;
import kg.eco.operator.integration.customs.CustomsServicePort;
import kg.eco.operator.integration.customs.dto.CustomsDeclarationRequest;
import kg.eco.operator.integration.customs.dto.CustomsDeclarationResponse;
import kg.eco.operator.integration.customs.dto.CustomsImportItem;
import kg.eco.operator.integration.taxservice.TaxServicePort;
import kg.eco.operator.integration.taxservice.dto.TaxCompanyRegistrationResponse;
import kg.eco.operator.integration.taxservice.dto.TaxInnVerificationResponse;
import kg.eco.operator.repository.DetectedCompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MonitoringScheduler {

    private static final List<String> PRODUCER_OKED_CODES = List.of(
            "22.21", "22.22", "22.23", "22.29",
            "17.21", "17.22", "17.23", "17.24", "17.29",
            "25.11", "25.12", "25.21", "25.29",
            "20.41", "20.42",
            "11.01", "11.02", "11.03", "11.05", "11.06",
            "10.81", "10.82", "10.83", "10.84",
            "38.11", "38.21"
    );

    private final CustomsServicePort customsServicePort;
    private final TaxServicePort taxServicePort;
    private final DetectedCompanyRepository detectedCompanyRepository;

    /**
     * Мониторинг ГТС — каждый день в 02:00
     * Получает таможенные декларации за последние 3 дня
     * Находит компании не зарегистрированные в системе
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void monitorCustomsDeclarations() {
        log.info("=== Запуск мониторинга ГТС ===");

        CustomsDeclarationRequest request = CustomsDeclarationRequest.builder()
                .periodFrom(LocalDate.now().minusDays(3))
                .periodTo(LocalDate.now())
                .build();

        List<CustomsDeclarationResponse> declarations =
                customsServicePort.getImportDeclarations(request);

        log.info("Получено деклараций из ГТС: {}", declarations.size());

        int newCount = 0;
        for (CustomsDeclarationResponse declaration : declarations) {
            for (CustomsImportItem item : declaration.getItems()) {
                String inn = declaration.getCompanyInn();
                if (inn == null || inn.isBlank()) continue;

                // Уже есть в выявленных — пропускаем
                if (detectedCompanyRepository.existsByInn(inn)) {
                    log.debug("ИНН {} уже в очереди, пропускаем", inn);
                    continue;
                }

                // Проверяем статус в ГНС
                TaxInnVerificationResponse verification = taxServicePort.verifyInn(inn);

                // Ликвидированные не добавляем
                if ("liquidated".equals(verification.getStatus())) {
                    log.info("ИНН {} ликвидирован, пропускаем", inn);
                    continue;
                }

                // Получаем полные данные компании
                TaxCompanyRegistrationResponse details =
                        taxServicePort.getCompanyRegistration(inn);

                // Собираем ТН ВЭД коды из всех позиций декларации
                String tnvedCodes = declaration.getItems().stream()
                        .map(CustomsImportItem::getTnvedCode)
                        .distinct()
                        .collect(Collectors.joining(", "));

                // Суммарный вес из декларации
                BigDecimal totalMass = declaration.getItems().stream()
                        .map(i -> i.getWeightKg())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                DetectedCompany detected = DetectedCompany.builder()
                        .inn(inn)
                        .companyName(details.getOfficialName())
                        .legalForm(details.getLegalForm())
                        .legalAddress(details.getLegalAddress())
                        .director(details.getDirector())
                        .phone(details.getPhone())
                        .email(details.getEmail())
                        .okpoCode(details.getOkpoCode())
                        .okedCodes(details.getOkedCodes() != null
                                ? String.join(", ", details.getOkedCodes()) : null)
                        .source("gts")
                        .status("new")
                        .tnvedCodes(tnvedCodes)
                        .estimatedMass(totalMass)
                        .gnsStatus(verification.getStatus())
                        .build();

                detectedCompanyRepository.save(detected);
                newCount++;
                log.info("Добавлена новая компания из ГТС: {} ({})", inn, details.getOfficialName());
            }
        }

        log.info("=== Мониторинг ГТС завершён. Новых компаний: {} ===", newCount);
    }

    /**
     * Запуск мониторинга ГТС вручную (для тестирования)
     */
    @Transactional
    public int runGtsMonitoringNow() {
        log.info("Ручной запуск мониторинга ГТС");

        CustomsDeclarationRequest request = CustomsDeclarationRequest.builder()
                .periodFrom(LocalDate.now().minusDays(3))
                .periodTo(LocalDate.now())
                .build();

        List<CustomsDeclarationResponse> declarations =
                customsServicePort.getImportDeclarations(request);

        int newCount = 0;
        for (CustomsDeclarationResponse declaration : declarations) {
            String inn = declaration.getCompanyInn();
            if (inn == null || inn.isBlank()) continue;
            if (detectedCompanyRepository.existsByInn(inn)) continue;

            TaxInnVerificationResponse verification = taxServicePort.verifyInn(inn);
            if ("liquidated".equals(verification.getStatus())) continue;

            TaxCompanyRegistrationResponse details =
                    taxServicePort.getCompanyRegistration(inn);

            String tnvedCodes = declaration.getItems().stream()
                    .map(CustomsImportItem::getTnvedCode)
                    .distinct()
                    .collect(Collectors.joining(", "));

            BigDecimal totalMass = declaration.getItems().stream()
                    .map(i -> i.getWeightKg())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            DetectedCompany detected = DetectedCompany.builder()
                    .inn(inn)
                    .companyName(details.getOfficialName())
                    .legalForm(details.getLegalForm())
                    .legalAddress(details.getLegalAddress())
                    .director(details.getDirector())
                    .phone(details.getPhone())
                    .email(details.getEmail())
                    .okpoCode(details.getOkpoCode())
                    .okedCodes(details.getOkedCodes() != null
                            ? String.join(", ", details.getOkedCodes()) : null)
                    .source("gts")
                    .status("new")
                    .tnvedCodes(tnvedCodes)
                    .estimatedMass(totalMass)
                    .gnsStatus(verification.getStatus())
                    .build();

            detectedCompanyRepository.save(detected);
            newCount++;
        }

        return newCount;
    }

    /**
     * Мониторинг ГНС — каждый день в 03:00
     * Получает компании-производители по ОКЭД кодам
     * Находит компании не зарегистрированные в системе
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void monitorGnsProducers() {
        log.info("=== Запуск мониторинга ГНС (производители) ===");

        List<TaxCompanyRegistrationResponse> companies =
                taxServicePort.getCompaniesByOkedCodes(PRODUCER_OKED_CODES);

        log.info("Получено компаний из ГНС: {}", companies.size());

        int newCount = 0;
        for (TaxCompanyRegistrationResponse company : companies) {
            String inn = company.getInn();
            if (inn == null || inn.isBlank()) continue;

            // Уже есть в выявленных — пропускаем
            if (detectedCompanyRepository.existsByInn(inn)) {
                log.debug("ИНН {} уже в очереди, пропускаем", inn);
                continue;
            }

            // Проверяем статус в ГНС
            TaxInnVerificationResponse verification = taxServicePort.verifyInn(inn);

            // Ликвидированные не добавляем
            if ("liquidated".equals(verification.getStatus())) {
                log.info("ИНН {} ликвидирован, пропускаем", inn);
                continue;
            }

            // Получаем полные данные компании
            TaxCompanyRegistrationResponse details =
                    taxServicePort.getCompanyRegistration(inn);

            DetectedCompany detected = DetectedCompany.builder()
                    .inn(inn)
                    .companyName(details.getOfficialName())
                    .legalForm(details.getLegalForm())
                    .legalAddress(details.getLegalAddress())
                    .director(details.getDirector())
                    .phone(details.getPhone())
                    .email(details.getEmail())
                    .okpoCode(details.getOkpoCode())
                    .okedCodes(details.getOkedCodes() != null
                            ? String.join(", ", details.getOkedCodes()) : null)
                    .source("gns")
                    .status("new")
                    .gnsStatus(verification.getStatus())
                    .build();

            detectedCompanyRepository.save(detected);
            newCount++;
            log.info("Добавлена новая компания из ГНС: {} ({})", inn, details.getOfficialName());
        }

        log.info("=== Мониторинг ГНС завершён. Новых компаний: {} ===", newCount);
    }

    /**
     * Запуск мониторинга ГНС вручную (для тестирования)
     */
    @Transactional
    public int runGnsMonitoringNow() {
        log.info("Ручной запуск мониторинга ГНС");

        List<TaxCompanyRegistrationResponse> companies =
                taxServicePort.getCompaniesByOkedCodes(PRODUCER_OKED_CODES);

        int newCount = 0;
        for (TaxCompanyRegistrationResponse company : companies) {
            String inn = company.getInn();
            if (inn == null || inn.isBlank()) continue;
            if (detectedCompanyRepository.existsByInn(inn)) continue;

            TaxInnVerificationResponse verification = taxServicePort.verifyInn(inn);
            if ("liquidated".equals(verification.getStatus())) continue;

            TaxCompanyRegistrationResponse details =
                    taxServicePort.getCompanyRegistration(inn);

            DetectedCompany detected = DetectedCompany.builder()
                    .inn(inn)
                    .companyName(details.getOfficialName())
                    .legalForm(details.getLegalForm())
                    .legalAddress(details.getLegalAddress())
                    .director(details.getDirector())
                    .phone(details.getPhone())
                    .email(details.getEmail())
                    .okpoCode(details.getOkpoCode())
                    .okedCodes(details.getOkedCodes() != null
                            ? String.join(", ", details.getOkedCodes()) : null)
                    .source("gns")
                    .status("new")
                    .gnsStatus(verification.getStatus())
                    .build();

            detectedCompanyRepository.save(detected);
            newCount++;
        }

        return newCount;
    }
}
