package kg.eco.operator.dto.response;

import kg.eco.operator.entity.enums.PublicationAuthorOrg;
import kg.eco.operator.entity.enums.PublicationCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO для списка публикаций (главная страница, админка).
 * НЕ содержит body_* — это могут быть мегабайты текста.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicationListItemResponse {
    private Long id;
    private String slug;
    private PublicationCategory category;
    private PublicationAuthorOrg authorOrg;
    private String coverUrl;
    private String title;
    private String excerpt;
    private Integer readMinutes;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
}
