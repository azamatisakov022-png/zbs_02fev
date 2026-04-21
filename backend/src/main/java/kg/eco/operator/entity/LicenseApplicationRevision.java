package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Снимок состояния заявки на момент каждой подачи (submit/resubmit).
 * Необходим для аудита при переоткрытии заявки после отказа.
 * Маппится на таблицу license_application_revisions (миграция V18).
 */
@Data
@Entity
@Table(name = "license_application_revisions")
public class LicenseApplicationRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private LicenseApplication application;

    @Column(name = "revision_number", nullable = false)
    private Integer revisionNumber;

    /**
     * JSON-снимок значимых полей заявки + ссылки на документы.
     * Формат произвольный (сериализуется сервисом).
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String snapshot;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
