package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kg.eco.operator.entity.enums.PublicationCategory;
import lombok.Data;

/**
 * Создание / обновление публикации.
 *
 * - title_ru, excerpt_ru, body_ru ОБЯЗАТЕЛЬНЫ.
 * - ky/en — опциональные.
 * - cover_url передаётся отдельным запросом upload-а
 *   (POST /publications/{id}/cover, multipart) ПОСЛЕ создания.
 *   На POST /publications cover_url может быть null или demo-URL.
 * - slug — генерируется автоматически из title_ru если не передан.
 * - author_org НЕ передаётся клиентом: вычисляется из роли пользователя
 *   (EMPLOYEE → MPRETN, ECO_OPERATOR → ECO_OPERATOR, ADMIN → ADMIN_GENERIC).
 */
@Data
public class CreatePublicationRequest {

    @NotNull
    private PublicationCategory category;

    private String slug; // optional

    private String coverUrl; // optional на POST, обязательно перед публикацией

    @NotBlank
    @Size(max = 500)
    private String titleRu;

    @Size(max = 500)
    private String titleKy;

    @Size(max = 500)
    private String titleEn;

    @NotBlank
    private String excerptRu;

    private String excerptKy;

    private String excerptEn;

    @NotBlank
    private String bodyRu;

    private String bodyKy;

    private String bodyEn;

    private Integer readMinutes;
}
