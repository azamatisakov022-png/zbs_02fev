package kg.eco.operator.service.impl;

import kg.eco.operator.dto.response.*;
import kg.eco.operator.entity.enums.CalculationStatus;
import kg.eco.operator.repository.*;
import kg.eco.operator.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PayerRepository payerRepository;
    private final AccountRepository accountRepository;
    private final CalculationRepository calculationRepository;
    private final RecyclerRepository recyclerRepository;
    private final RecyclerCapacityRepository capacityRepository;
    private final LandfillRepository landfillRepository;
    private final DumpRepository dumpRepository;
    private final CategoryRepository categoryRepository;
    private final RateRepository rateRepository;
    private final RecyclingNormRepository recyclingNormRepository;

    @Override
    public AnalyticsSummaryResponse getSummary(String periodFrom, String periodTo, String region) {
        long totalPayers = payerRepository.count();
        long activePayers = payerRepository.countActive();

        BigDecimal totalCharged = accountRepository.sumTotalPaid(); // total charged across all accounts
        BigDecimal totalCollected = accountRepository.sumTotalPaid();

        BigDecimal collectionRate = BigDecimal.ZERO;
        if (totalCharged.compareTo(BigDecimal.ZERO) > 0) {
            collectionRate = totalCollected.multiply(BigDecimal.valueOf(100))
                    .divide(totalCharged, 2, RoundingMode.HALF_UP);
        }

        BigDecimal totalCapacity = capacityRepository.sumTotalCapacity();
        BigDecimal totalLoad = capacityRepository.sumTotalLoad();
        BigDecimal recyclingRate = BigDecimal.ZERO;
        if (totalCapacity.compareTo(BigDecimal.ZERO) > 0) {
            recyclingRate = totalLoad.multiply(BigDecimal.valueOf(100))
                    .divide(totalCapacity, 2, RoundingMode.HALF_UP);
        }

        long pendingCalculations = calculationRepository.countByStatus(CalculationStatus.SUBMITTED)
                + calculationRepository.countByStatus(CalculationStatus.UNDER_REVIEW);
        long pendingDeclarations = 0; // TODO: from DeclarationRepository when implemented

        return AnalyticsSummaryResponse.builder()
                .totalPayers(totalPayers)
                .activePayers(activePayers)
                .totalCharged(totalCharged)
                .totalCollected(totalCollected)
                .collectionRate(collectionRate)
                .totalRecycled(totalLoad)
                .recyclingRate(recyclingRate)
                .pendingCalculations(pendingCalculations)
                .pendingDeclarations(pendingDeclarations)
                .build();
    }

    @Override
    public List<IncomeDataResponse> getIncome(String groupBy, String periodFrom, String periodTo) {
        // Simplified — returns aggregated data
        // In production, this would query transactions grouped by period
        List<IncomeDataResponse> result = new ArrayList<>();
        result.add(IncomeDataResponse.builder()
                .period("2025")
                .charged(accountRepository.sumTotalPaid())
                .collected(accountRepository.sumTotalPaid())
                .refunded(BigDecimal.ZERO)
                .build());
        return result;
    }

    @Override
    public List<RecyclingDataResponse> getRecycling(String productGroup, String periodFrom, String periodTo) {
        var categories = categoryRepository.findAll();
        return categories.stream()
                .map(cat -> {
                    BigDecimal capacity = capacityRepository.sumCapacityByGroup(cat.getName());
                    BigDecimal load = capacityRepository.sumLoadByGroup(cat.getName());
                    BigDecimal percent = capacity.compareTo(BigDecimal.ZERO) > 0
                            ? load.multiply(BigDecimal.valueOf(100))
                                    .divide(capacity, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

                    // Get norm for current year
                    var norm = recyclingNormRepository.findByCategory_IdAndYear(cat.getId(), 2025);
                    BigDecimal normPercent = norm.map(kg.eco.operator.entity.RecyclingNorm::getNormPercent)
                            .orElse(BigDecimal.ZERO);

                    return RecyclingDataResponse.builder()
                            .wasteGroup(cat.getName())
                            .volumeReceived(capacity)
                            .volumeProcessed(load)
                            .recyclingPercent(percent)
                            .norm(normPercent)
                            .build();
                })
                .filter(r -> productGroup == null || r.getWasteGroup().contains(productGroup))
                .collect(Collectors.toList());
    }

    @Override
    public List<RegionDataResponse> getRegions() {
        // Get distinct regions from payers (companies)
        List<String> regions = List.of(
                "г. Бишкек", "Чуйская обл.", "Ошская обл.", "Джалал-Абадская обл.",
                "Иссык-Кульская обл.", "Нарынская обл.", "Таласская обл.", "Баткенская обл.");

        return regions.stream()
                .map(region -> RegionDataResponse.builder()
                        .region(region)
                        .payersCount(0) // TODO: count by region
                        .recyclersCount(0)
                        .landfillsCount(0)
                        .dumpsCount(0)
                        .totalWaste(BigDecimal.ZERO)
                        .totalRecycled(BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public byte[] exportReport(String format, String reportType, String periodFrom, String periodTo) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(getSheetName(reportType));

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            switch (reportType) {
                case "pkm730" -> buildPkm730Report(workbook, sheet, headerStyle);
                case "pkm563" -> buildPkm563Report(workbook, sheet, headerStyle);
                case "summary" -> buildSummaryReport(workbook, sheet, headerStyle);
                case "payers" -> buildPayersReport(workbook, sheet, headerStyle);
                case "recyclers" -> buildRecyclersReport(workbook, sheet, headerStyle);
                default -> buildSummaryReport(workbook, sheet, headerStyle);
            }

            // Auto-size columns
            for (int i = 0; i < 10; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Ошибка формирования отчёта", e);
        }
    }

    // ─── Report builders ───

    private void buildPkm730Report(XSSFWorkbook workbook, Sheet sheet, CellStyle headerStyle) {
        // ПКМ №730 — Ставки утилизационного сбора
        String[] headers = {"№", "Группа продукции", "Наименование", "Ед. измерения", "Ставка (сом)"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        var rates = rateRepository.findAll();
        int rowIdx = 1;
        for (var rate : rates) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(rate.getCategory().getGroupNumber());
            row.createCell(1).setCellValue(rate.getCategory().getName());
            row.createCell(2).setCellValue(rate.getCategory().getDescription() != null
                    ? rate.getCategory().getDescription() : "");
            row.createCell(3).setCellValue(rate.getCategory().getUnit() != null
                    ? rate.getCategory().getUnit() : "тонн");
            row.createCell(4).setCellValue(rate.getRatePerUnit().doubleValue());
        }
    }

    private void buildPkm563Report(XSSFWorkbook workbook, Sheet sheet, CellStyle headerStyle) {
        // ПКМ №563 — Нормативы переработки
        String[] headers = {"№", "Группа отходов", "Год", "Норматив (%)"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        var norms = recyclingNormRepository.findAll();
        int rowIdx = 1;
        for (var norm : norms) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(norm.getCategory().getGroupNumber());
            row.createCell(1).setCellValue(norm.getCategory().getName());
            row.createCell(2).setCellValue(norm.getYear());
            row.createCell(3).setCellValue(norm.getNormPercent().doubleValue());
        }
    }

    private void buildSummaryReport(XSSFWorkbook workbook, Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"Показатель", "Значение"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        var summary = getSummary(null, null, null);
        int rowIdx = 1;
        addSummaryRow(sheet, rowIdx++, "Всего плательщиков", String.valueOf(summary.getTotalPayers()));
        addSummaryRow(sheet, rowIdx++, "Активных плательщиков", String.valueOf(summary.getActivePayers()));
        addSummaryRow(sheet, rowIdx++, "Всего начислено", summary.getTotalCharged().toPlainString());
        addSummaryRow(sheet, rowIdx++, "Всего собрано", summary.getTotalCollected().toPlainString());
        addSummaryRow(sheet, rowIdx++, "% собираемости", summary.getCollectionRate().toPlainString());
        addSummaryRow(sheet, rowIdx++, "Объём переработки", summary.getTotalRecycled().toPlainString());
        addSummaryRow(sheet, rowIdx++, "% переработки", summary.getRecyclingRate().toPlainString());
        addSummaryRow(sheet, rowIdx++, "Расчётов на рассмотрении", String.valueOf(summary.getPendingCalculations()));
    }

    private void buildPayersReport(XSSFWorkbook workbook, Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"№", "Компания", "ИНН", "Категория", "Статус", "Статус расчётов"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        var payers = payerRepository.findAll();
        int rowIdx = 1;
        for (var payer : payers) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(rowIdx - 1);
            row.createCell(1).setCellValue(payer.getCompany().getCompanyName());
            row.createCell(2).setCellValue(payer.getCompany().getInn());
            row.createCell(3).setCellValue(payer.getCategory() != null
                    ? payer.getCategory().name() : "");
            row.createCell(4).setCellValue(payer.getSystemStatus() != null
                    ? payer.getSystemStatus().name() : "");
            row.createCell(5).setCellValue(payer.getSettlementStatus() != null
                    ? payer.getSettlementStatus().name() : "");
        }
    }

    private void buildRecyclersReport(XSSFWorkbook workbook, Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"№", "Компания", "ИНН", "Регион", "Статус", "Мощность (т/мес)"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        var recyclers = recyclerRepository.findAll();
        int rowIdx = 1;
        for (var recycler : recyclers) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(rowIdx - 1);
            row.createCell(1).setCellValue(recycler.getCompanyName());
            row.createCell(2).setCellValue(recycler.getInn());
            row.createCell(3).setCellValue(recycler.getRegion() != null ? recycler.getRegion() : "");
            row.createCell(4).setCellValue(recycler.getStatus().name());
            BigDecimal totalCapacity = recycler.getCapacities().stream()
                    .map(c -> c.getMonthlyCapacity() != null ? c.getMonthlyCapacity() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            row.createCell(5).setCellValue(totalCapacity.doubleValue());
        }
    }

    private void addSummaryRow(Sheet sheet, int rowIdx, String label, String value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }

    private String getSheetName(String reportType) {
        return switch (reportType) {
            case "pkm730" -> "ПКМ №730 Ставки";
            case "pkm563" -> "ПКМ №563 Нормативы";
            case "payers" -> "Плательщики";
            case "recyclers" -> "Переработчики";
            default -> "Сводка";
        };
    }
}
