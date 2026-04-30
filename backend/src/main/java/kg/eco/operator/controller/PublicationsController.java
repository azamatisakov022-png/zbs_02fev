package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.CreatePublicationRequest;
import kg.eco.operator.dto.response.PublicationListItemResponse;
import kg.eco.operator.dto.response.PublicationResponse;
import kg.eco.operator.service.PublicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Админ-API раздела «Публикации» (требует авторизацию).
 *
 * Доступ:
 *   - EMPLOYEE (МПРЭТН), ECO_OPERATOR, ADMIN — могут читать свои/все публикации,
 *     создавать, редактировать только в рамках своей организации;
 *   - ADMIN — может всё (включая удаление).
 *
 * Контроль автора-публикации (своя/чужая) — на уровне сервиса.
 */
@RestController
@RequestMapping("/publications")
@RequiredArgsConstructor
public class PublicationsController {

    private final PublicationService publicationService;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ECO_OPERATOR', 'ADMIN')")
    public Page<PublicationListItemResponse> listAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return publicationService.listForAdmin(page, size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ECO_OPERATOR', 'ADMIN')")
    public PublicationResponse getById(@PathVariable Long id) {
        return publicationService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ECO_OPERATOR', 'ADMIN')")
    public PublicationResponse create(@Valid @RequestBody CreatePublicationRequest request) {
        return publicationService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ECO_OPERATOR', 'ADMIN')")
    public PublicationResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CreatePublicationRequest request) {
        return publicationService.update(id, request);
    }

    @PostMapping(value = "/{id}/cover", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ECO_OPERATOR', 'ADMIN')")
    public PublicationResponse uploadCover(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return publicationService.uploadCover(id, file);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ECO_OPERATOR', 'ADMIN')")
    public PublicationResponse publish(@PathVariable Long id) {
        return publicationService.publish(id);
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ECO_OPERATOR', 'ADMIN')")
    public PublicationResponse unpublish(@PathVariable Long id) {
        return publicationService.unpublish(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        publicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
