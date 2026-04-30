package kg.eco.operator.dto.response;

import kg.eco.operator.entity.enums.PublicationAuthorOrg;
import kg.eco.operator.entity.enums.PublicationCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Полное DTO одной публикации для детальной страницы.
 * Содержит body на запрошенном языке (с fallback на ru).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicationResponse {
    private Long id;
    private String slug;
    private PublicationCategory category;
    private PublicationAuthorOrg authorOrg;
    private String coverUrl;

    // Контент на запрошенном языке (с fallback на ru если перевода нет)
    private String title;
    private String excerpt;
    private String body;

    /** Доступные языки публикации (для UI-табов RU/KY/EN). */
    private boolean hasRu;
    private boolean hasKy;
    private boolean hasEn;

    private Integer readMinutes;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
    private LocalDateTime updatedAt;
    private Integer viewCount;
}
