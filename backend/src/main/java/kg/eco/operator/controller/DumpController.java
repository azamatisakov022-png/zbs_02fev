package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.DumpCreateRequest;
import kg.eco.operator.dto.response.DumpResponse;
import kg.eco.operator.service.DumpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dumps")
@RequiredArgsConstructor
public class DumpController {

    private final DumpService dumpService;

    /**
     * GET /dumps/public — Публичный реестр свалок (без авторизации)
     */
    @GetMapping("/public")
    public ResponseEntity<List<DumpResponse>> getPublic() {
        return ResponseEntity.ok(dumpService.getAll(null, null));
    }

    /**
     * GET /dumps — Реестр несанкционированных свалок
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<DumpResponse>> getAll(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(dumpService.getAll(region, status));
    }

    /**
     * POST /dumps — Добавить свалку
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<DumpResponse> create(@Valid @RequestBody DumpCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dumpService.create(request));
    }

    /**
     * GET /dumps/{id} — Свалка по ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<DumpResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(dumpService.getById(id));
    }

    /**
     * PUT /dumps/{id} — Обновить свалку
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<DumpResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DumpCreateRequest request) {

        return ResponseEntity.ok(dumpService.update(id, request));
    }

    /**
     * DELETE /dumps/{id} — Удалить свалку
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dumpService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /dumps/by-region/{region} — Свалки по региону
     */
    @GetMapping("/by-region/{region}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<DumpResponse>> getByRegion(@PathVariable String region) {
        return ResponseEntity.ok(dumpService.getByRegion(region));
    }

    /**
     * GET /dumps/by-status/{status} — Свалки по статусу
     */
    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<DumpResponse>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(dumpService.getByStatus(status));
    }
}
