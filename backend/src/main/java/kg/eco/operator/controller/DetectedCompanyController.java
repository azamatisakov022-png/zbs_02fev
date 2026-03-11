package kg.eco.operator.controller;

import kg.eco.operator.dto.response.DetectedCompanyResponse;
import kg.eco.operator.service.DetectedCompanyService;
import kg.eco.operator.service.impl.MonitoringScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/detected-companies")
@RequiredArgsConstructor
public class DetectedCompanyController {

    private final DetectedCompanyService detectedCompanyService;
    private final MonitoringScheduler monitoringScheduler;

    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<Page<DetectedCompanyResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(detectedCompanyService.getAll(
                status, source, search,
                PageRequest.of(page, size, Sort.by("created_at").descending())));
    }

    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<DetectedCompanyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(detectedCompanyService.getById(id));
    }

    @PostMapping("/{id:\\d+}/notify")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<DetectedCompanyResponse> notify(@PathVariable Long id) {
        return ResponseEntity.ok(detectedCompanyService.notify(id));
    }

    @PostMapping("/{id:\\d+}/reject")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<DetectedCompanyResponse> reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(detectedCompanyService.reject(id, body.get("reason")));
    }

    @PostMapping("/{id:\\d+}/assign")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<DetectedCompanyResponse> assign(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(detectedCompanyService.assignEmployee(id, body.get("employeeId")));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<Object> getStats() {
        return ResponseEntity.ok(detectedCompanyService.getStats());
    }

    /**
     * Ручной запуск мониторинга ГТС (для тестирования и экстренного запуска)
     * POST /detected-companies/run-gts-monitoring
     */
    @PostMapping("/run-gts-monitoring")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> runGtsMonitoring() {
        int newCount = monitoringScheduler.runGtsMonitoringNow();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "newCompaniesFound", newCount,
                "message", "Мониторинг ГТС выполнен. Новых компаний: " + newCount
        ));
    }

    /**
     * Ручной запуск мониторинга ГНС (для тестирования и экстренного запуска)
     * POST /detected-companies/run-gns-monitoring
     */
    @PostMapping("/run-gns-monitoring")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> runGnsMonitoring() {
        int newCount = monitoringScheduler.runGnsMonitoringNow();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "newCompaniesFound", newCount,
                "message", "Мониторинг ГНС выполнен. Новых компаний: " + newCount
        ));
    }
}
