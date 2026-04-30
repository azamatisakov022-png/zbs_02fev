package kg.eco.operator.repository;

import kg.eco.operator.entity.Publication;
import kg.eco.operator.entity.enums.PublicationAuthorOrg;
import kg.eco.operator.entity.enums.PublicationCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {

    /**
     * Публичная лента — только опубликованные. Поддержка фильтра по категории
     * (опционально) и поиска по title/excerpt (опционально).
     */
    @Query("""
            SELECT p FROM Publication p
             WHERE p.isPublished = TRUE
               AND (:category IS NULL OR p.category = :category)
               AND (:q IS NULL OR :q = ''
                    OR LOWER(p.titleRu)   LIKE LOWER(CONCAT('%', :q, '%'))
                    OR LOWER(p.excerptRu) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Publication> findPublic(
            @Param("category") PublicationCategory category,
            @Param("q") String q,
            Pageable pageable);

    Optional<Publication> findBySlugAndIsPublishedTrue(String slug);

    Optional<Publication> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /** Самая свежая опубликованная — для hero-карточки на главной. */
    @Query("""
            SELECT p FROM Publication p
             WHERE p.isPublished = TRUE
             ORDER BY p.publishedAt DESC
            """)
    Page<Publication> findLatestPublished(Pageable pageable);

    /**
     * Список для админки — с возможностью видеть и снятые с публикации.
     * Если authorOrg не null — фильтрует по автору (для не-админов).
     */
    @Query("""
            SELECT p FROM Publication p
             WHERE (:authorOrg IS NULL OR p.authorOrg = :authorOrg)
            """)
    Page<Publication> findForAdmin(
            @Param("authorOrg") PublicationAuthorOrg authorOrg,
            Pageable pageable);
}
