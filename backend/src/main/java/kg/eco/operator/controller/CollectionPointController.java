package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.CollectionPointCreateRequest;
import kg.eco.operator.dto.response.CollectionPointResponse;
import kg.eco.operator.service.CollectionPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/collection-points")
@RequiredArgsConstructor
public class CollectionPointController {

    private final CollectionPointService collectionPointService;

    /**
     * GET /collection-points/public — Публичный реестр пунктов приёма (без авторизации)
     */
    @GetMapping("/public")
    public ResponseEntity<List<CollectionPointResponse>> getPublic() {
        return ResponseEntity.ok(collectionPointService.getAll(null, null));
    }

    /**
     * GET /collection-points — Реестр пунктов приёма
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<CollectionPointResponse>> getAll(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(collectionPointService.getAll(region, status));
    }

    /**
     * POST /collection-points — Добавить пункт приёма
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<CollectionPointResponse> create(
            @Valid @RequestBody CollectionPointCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(collectionPointService.create(request));
    }

    /**
     * GET /collection-points/{id} — Пункт по ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<CollectionPointResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(collectionPointService.getById(id));
    }

    /**
     * PUT /collection-points/{id} — Обновить пункт
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<CollectionPointResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CollectionPointCreateRequest request) {

        return ResponseEntity.ok(collectionPointService.update(id, request));
    }

    /**
     * DELETE /collection-points/{id} — Удалить пункт
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        collectionPointService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /collection-points/by-region/{region} — Пункты по региону
     */
    @GetMapping("/by-region/{region}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN', 'MINISTRY')")
    public ResponseEntity<List<CollectionPointResponse>> getByRegion(@PathVariable String region) {
        return ResponseEntity.ok(collectionPointService.getByRegion(region));
    }

    /**
     * GET /collection-points/active — Активные пункты
     */
    @GetMapping("/active")
    public ResponseEntity<List<CollectionPointResponse>> getActive() {
        return ResponseEntity.ok(collectionPointService.getActive());
    }
}
