package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.LandfillCreateRequest;
import kg.eco.operator.dto.response.LandfillResponse;
import kg.eco.operator.dto.response.LandfillStatsResponse;
import kg.eco.operator.service.LandfillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/landfills")
@RequiredArgsConstructor
public class LandfillController {

    private final LandfillService landfillService;

    /**
     * GET /landfills — Реестр полигонов ТБО
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<LandfillResponse>> getAll(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(landfillService.getAll(region, type, status));
    }

    /**
     * POST /landfills — Добавить полигон
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<LandfillResponse> create(@Valid @RequestBody LandfillCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(landfillService.create(request));
    }

    /**
     * GET /landfills/{id} — Полигон по ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<LandfillResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(landfillService.getById(id));
    }

    /**
     * PUT /landfills/{id} — Обновить полигон
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<LandfillResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LandfillCreateRequest request) {

        return ResponseEntity.ok(landfillService.update(id, request));
    }

    /**
     * GET /landfills/active — Активные полигоны
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<LandfillResponse>> getActive() {
        return ResponseEntity.ok(landfillService.getActive());
    }

    /**
     * GET /landfills/by-region/{region} — Полигоны по региону
     */
    @GetMapping("/by-region/{region}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<LandfillResponse>> getByRegion(@PathVariable String region) {
        return ResponseEntity.ok(landfillService.getByRegion(region));
    }

    /**
     * GET /landfills/by-type/{type} — Полигоны по типу
     */
    @GetMapping("/by-type/{type}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<LandfillResponse>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(landfillService.getByType(type));
    }

    /**
     * GET /landfills/by-status/{status} — Полигоны по статусу
     */
    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<LandfillResponse>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(landfillService.getByStatus(status));
    }

    /**
     * GET /landfills/stats — Статистика полигонов
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<LandfillStatsResponse> getStats() {
        return ResponseEntity.ok(landfillService.getStats());
    }
}
