package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.RecyclerCreateRequest;
import kg.eco.operator.dto.request.RecyclerToggleStatusRequest;
import kg.eco.operator.dto.response.*;
import kg.eco.operator.service.RecyclerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recyclers")
@RequiredArgsConstructor
public class RecyclerController {

    private final RecyclerService recyclerService;

    /**
     * GET /recyclers — Реестр переработчиков (пагинация, фильтры)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<PaginatedResponse<RecyclerResponse>> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String wasteGroup) {

        return ResponseEntity.ok(
                recyclerService.getAll(page, pageSize, search, region, status, wasteGroup));
    }

    /**
     * POST /recyclers — Добавить переработчика
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<RecyclerResponse> create(@Valid @RequestBody RecyclerCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recyclerService.create(request));
    }

    /**
     * GET /recyclers/{id} — Карточка переработчика
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<RecyclerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(recyclerService.getById(id));
    }

    /**
     * PUT /recyclers/{id} — Обновить данные переработчика
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<RecyclerResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RecyclerCreateRequest request) {

        return ResponseEntity.ok(recyclerService.update(id, request));
    }

    /**
     * POST /recyclers/{id}/toggle-status — Переключить статус
     */
    @PostMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<RecyclerResponse> toggleStatus(
            @PathVariable Long id,
            @RequestBody(required = false) RecyclerToggleStatusRequest request) {

        return ResponseEntity.ok(recyclerService.toggleStatus(id,
                request != null ? request : new RecyclerToggleStatusRequest()));
    }

    /**
     * GET /recyclers/active — Только активные переработчики
     */
    @GetMapping("/active")
    public ResponseEntity<List<RecyclerResponse>> getActive() {
        return ResponseEntity.ok(recyclerService.getActive());
    }

    /**
     * GET /recyclers/by-group/{wasteGroup} — Переработчики по группе отходов
     */
    @GetMapping("/by-group/{wasteGroup}")
    public ResponseEntity<List<RecyclerResponse>> getByGroup(@PathVariable String wasteGroup) {
        return ResponseEntity.ok(recyclerService.getByGroup(wasteGroup));
    }

    /**
     * GET /recyclers/stats — Статистика переработчиков
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<RecyclerStatsResponse> getStats() {
        return ResponseEntity.ok(recyclerService.getStats());
    }

    /**
     * GET /recyclers/capacity/{wasteGroup} — Мощности по группе отходов
     */
    @GetMapping("/capacity/{wasteGroup}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<CapacityByGroupResponse> getCapacityByGroup(@PathVariable String wasteGroup) {
        return ResponseEntity.ok(recyclerService.getCapacityByGroup(wasteGroup));
    }
}
