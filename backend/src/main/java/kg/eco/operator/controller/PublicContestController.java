package kg.eco.operator.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import kg.eco.operator.dto.request.ContestApplicationStatusCheckRequest;
import kg.eco.operator.dto.response.ContestApplicationResponse;
import kg.eco.operator.dto.response.ContestApplicationStatusResponse;
import kg.eco.operator.dto.response.ContestResponse;
import kg.eco.operator.service.ContestApplicationService;
import kg.eco.operator.service.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Публичные эндпоинты конкурсов (без авторизации).
 * Префикс /public/** уже whitelisted в SecurityConfig.
 */
@RestController
@RequestMapping("/public/contests")
@RequiredArgsConstructor
@Validated
public class PublicContestController {

    private final ContestService contestService;
    private final ContestApplicationService applicationService;

    /** Список опубликованных конкурсов с открытым приёмом заявок. */
    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAll() {
        return ResponseEntity.ok(contestService.getPublic());
    }

    /** Детали конкурса (только опубликованные/закрытые). */
    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getPublicById(id));
    }

    /** Скачать положение конкурса (PDF) — публично. */
    @GetMapping("/{id}/regulations")
    public ResponseEntity<InputStreamResource> downloadRegulations(@PathVariable Long id) {
        // Через тот же сервис: getPublicById выбросит 404 для DRAFT
        contestService.getPublicById(id);
        ContestService.DownloadResult result = contestService.downloadRegulations(id);
        String encoded = URLEncoder.encode(
                result.fileName() != null ? result.fileName() : "regulations.pdf",
                StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(result.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename*=UTF-8''" + encoded)
                .body(new InputStreamResource(result.stream()));
    }

    /**
     * Подать заявку на конкретный конкурс. multipart/form-data.
     * Поля: lastName, firstName, middleName?, phone, email, file
     */
    @PostMapping(value = "/{contestId}/applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContestApplicationResponse> submit(
            @PathVariable Long contestId,
            @RequestParam("lastName") @NotBlank String lastName,
            @RequestParam("firstName") @NotBlank String firstName,
            @RequestParam(value = "middleName", required = false) String middleName,
            @RequestParam("phone") @NotBlank String phone,
            @RequestParam("email") @NotBlank @Email String email,
            @RequestParam("file") MultipartFile file) {

        ContestApplicationResponse response = applicationService.submit(
                contestId, lastName, firstName, middleName, phone, email, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Публичная проверка статуса по номеру + email. */
    @PostMapping("/applications/check-status")
    public ResponseEntity<ContestApplicationStatusResponse> checkStatus(
            @Valid @RequestBody ContestApplicationStatusCheckRequest request) {
        return ResponseEntity.ok(applicationService.checkStatus(request));
    }
}
