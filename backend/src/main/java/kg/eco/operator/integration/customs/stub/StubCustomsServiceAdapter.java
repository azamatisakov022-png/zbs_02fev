package kg.eco.operator.integration.customs.stub;

import kg.eco.operator.integration.customs.CustomsServicePort;
import kg.eco.operator.integration.customs.dto.CustomsDeclarationRequest;
import kg.eco.operator.integration.customs.dto.CustomsDeclarationResponse;
import kg.eco.operator.integration.customs.dto.CustomsImportItem;
import kg.eco.operator.integration.customs.dto.CustomsVolumeVerificationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Stub implementation of ГТС КР integration for dev/staging/demo.
 * Returns realistic Kyrgyz import data for known test INNs.
 */
@Slf4j
@Service
@Profile("!production")
public class StubCustomsServiceAdapter implements CustomsServicePort {

    @Override
    public List<CustomsDeclarationResponse> getImportDeclarations(CustomsDeclarationRequest request) {
        log.info("[STUB ГТС] Запрос ГТД: ИНН={}, период {}-{}",
                request.getCompanyInn(), request.getPeriodFrom(), request.getPeriodTo());

        List<CustomsDeclarationResponse> declarations = new ArrayList<>();

        declarations.add(CustomsDeclarationResponse.builder()
                .declarationNumber("10311010/150325/0001234")
                .declarationDate(request.getPeriodFrom().plusDays(15))
                .companyInn("11223344556677")
                .customsPost("Бишкекский таможенный пост")
                .countryOfOrigin("Китай")
                .items(List.of(
                        CustomsImportItem.builder()
                                .tnvedCode("4011100001")
                                .productDescription("Шины пневматические новые для легковых автомобилей")
                                .weightKg(new BigDecimal("15000"))
                                .weightNet(new BigDecimal("14500"))
                                .customsValue(new BigDecimal("2500000"))
                                .unit("кг")
                                .quantity(new BigDecimal("500"))
                                .productGroupMapping("Шины и покрышки")
                                .build(),
                        CustomsImportItem.builder()
                                .tnvedCode("8507100001")
                                .productDescription("Аккумуляторы свинцовые")
                                .weightKg(new BigDecimal("8000"))
                                .weightNet(new BigDecimal("7800"))
                                .customsValue(new BigDecimal("1800000"))
                                .unit("кг")
                                .quantity(new BigDecimal("200"))
                                .productGroupMapping("Аккумуляторы свинцовые")
                                .build()
                ))
                .build());

        declarations.add(CustomsDeclarationResponse.builder()
                .declarationNumber("10311010/200325/0001567")
                .declarationDate(request.getPeriodFrom().plusDays(20))
                .companyInn("99887766554433")
                .customsPost("Бишкекский таможенный пост")
                .countryOfOrigin("Россия")
                .items(List.of(
                        CustomsImportItem.builder()
                                .tnvedCode("3923210000")
                                .productDescription("Мешки и пакеты из полимеров этилена")
                                .weightKg(new BigDecimal("5000"))
                                .weightNet(new BigDecimal("4800"))
                                .customsValue(new BigDecimal("900000"))
                                .unit("кг")
                                .quantity(new BigDecimal("10000"))
                                .productGroupMapping("Упаковка из пластика")
                                .build()
                ))
                .build());

        return declarations;
    }

    @Override
    public CustomsVolumeVerificationResponse verifyDeclaredVolumes(
            String companyInn, int year, int quarter) {
        log.info("[STUB ГТС] Сверка объёмов: ИНН={}, год={}, квартал={}",
                companyInn, year, quarter);

        // Simulate small discrepancies (0-5%) for realism
        List<CustomsVolumeVerificationResponse.VolumeDiscrepancy> discrepancies = List.of(
                CustomsVolumeVerificationResponse.VolumeDiscrepancy.builder()
                        .productGroup("Шины и покрышки")
                        .declaredWeight(new BigDecimal("14.50"))
                        .customsWeight(new BigDecimal("14.50"))
                        .difference(BigDecimal.ZERO)
                        .differencePercent(0.0)
                        .build(),
                CustomsVolumeVerificationResponse.VolumeDiscrepancy.builder()
                        .productGroup("Аккумуляторы свинцовые")
                        .declaredWeight(new BigDecimal("7.50"))
                        .customsWeight(new BigDecimal("7.80"))
                        .difference(new BigDecimal("-0.30"))
                        .differencePercent(-3.85)
                        .build()
        );

        boolean hasDiscrepancies = discrepancies.stream()
                .anyMatch(d -> Math.abs(d.getDifferencePercent()) > 1.0);

        return CustomsVolumeVerificationResponse.builder()
                .companyInn(companyInn)
                .year(year)
                .quarter(quarter)
                .hasDiscrepancies(hasDiscrepancies)
                .discrepancies(discrepancies)
                .build();
    }
}
