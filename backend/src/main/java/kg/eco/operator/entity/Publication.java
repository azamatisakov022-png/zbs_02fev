package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.PublicationAuthorOrg;
import kg.eco.operator.entity.enums.PublicationCategory;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Публикация в разделе АИС «Публикации».
 *
 * Поддерживает 3 языка (RU обязательный, KY/EN опциональные с fallback на RU)
 * без отдельной таблицы переводов — для 3-х языков 9 колонок проще, чем
 * нормализованная схема, и быстрее в чтении.
 */
@Data
@Entity
@Table(name = "publications")
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PublicationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "author_org", nullable = false, length = 20)
    private PublicationAuthorOrg authorOrg;

    @Column(name = "cover_url", nullable = false, length = 500)
    private String coverUrl;

    // ─── Многоязычный контент ────────────────────────────────────
    @Column(name = "title_ru", nullable = false, length = 500)
    private String titleRu;

    @Column(name = "title_ky", length = 500)
    private String titleKy;

    @Column(name = "title_en", length = 500)
    private String titleEn;

    @Column(name = "excerpt_ru", nullable = false, columnDefinition = "TEXT")
    private String excerptRu;

    @Column(name = "excerpt_ky", columnDefinition = "TEXT")
    private String excerptKy;

    @Column(name = "excerpt_en", columnDefinition = "TEXT")
    private String excerptEn;

    @Column(name = "body_ru", nullable = false, columnDefinition = "TEXT")
    private String bodyRu;

    @Column(name = "body_ky", columnDefinition = "TEXT")
    private String bodyKy;

    @Column(name = "body_en", columnDefinition = "TEXT")
    private String bodyEn;

    @Column(name = "read_minutes", nullable = false)
    private Integer readMinutes = 1;

    // ─── Публикация / снятие с публикации ────────────────────────
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;

    @Column(name = "published_at", nullable = false)
    private LocalDateTime publishedAt;

    @Column(name = "unpublished_at")
    private LocalDateTime unpublishedAt;

    @Column(name = "unpublished_by_id")
    private Long unpublishedById;

    // ─── Audit ────────────────────────────────────────────────────
    @Column(name = "created_by_id")
    private Long createdById;

    @Column(name = "last_edited_by_id")
    private Long lastEditedById;

    @Column(name = "last_edited_at")
    private LocalDateTime lastEditedAt;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (publishedAt == null) publishedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
