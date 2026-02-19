package kg.eco.operator.controller;

import kg.eco.operator.dto.response.*;
import kg.eco.operator.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /analytics/summary — Общая аналитика системы
     */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary(
            @RequestParam(required = false) String periodFrom,
            @RequestParam(required = false) String periodTo,
            @RequestParam(required = false) String region) {

        return ResponseEntity.ok(analyticsService.getSummary(periodFrom, periodTo, region));
    }

    /**
     * GET /analytics/income — Динамика поступлений
     */
    @GetMapping("/income")
    public ResponseEntity<List<IncomeDataResponse>> getIncome(
            @RequestParam(required = false, defaultValue = "month") String groupBy,
            @RequestParam(required = false) String periodFrom,
            @RequestParam(required = false) String periodTo) {

        return ResponseEntity.ok(analyticsService.getIncome(groupBy, periodFrom, periodTo));
    }

    /**
     * GET /analytics/recycling — Аналитика переработки
     */
    @GetMapping("/recycling")
    public ResponseEntity<List<RecyclingDataResponse>> getRecycling(
            @RequestParam(required = false) String productGroup,
            @RequestParam(required = false) String periodFrom,
            @RequestParam(required = false) String periodTo) {

        return ResponseEntity.ok(analyticsService.getRecycling(productGroup, periodFrom, periodTo));
    }

    /**
     * GET /analytics/regions — Аналитика по регионам
     */
    @GetMapping("/regions")
    public ResponseEntity<List<RegionDataResponse>> getRegions() {
        return ResponseEntity.ok(analyticsService.getRegions());
    }

    /**
     * GET /analytics/export — Выгрузка отчёта (Excel/PDF)
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam String format,
            @RequestParam String reportType,
            @RequestParam(required = false) String periodFrom,
            @RequestParam(required = false) String periodTo) {

        byte[] reportData = analyticsService.exportReport(format, reportType, periodFrom, periodTo);

        String filename = "report_" + reportType + "." + format;
        MediaType mediaType = "xlsx".equals(format)
                ? MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                : MediaType.APPLICATION_PDF;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(reportData);
    }
}
