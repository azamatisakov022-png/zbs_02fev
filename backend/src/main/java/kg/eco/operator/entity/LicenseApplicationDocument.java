package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.LicenseDocumentType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Документ, приложенный к заявке на лицензию.
 * Файл хранится в S3/MinIO, в БД только метаданные.
 * Маппится на таблицу license_application_documents (миграция V18).
 */
@Data
@Entity
@Table(name = "license_application_documents")
public class LicenseApplicationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private LicenseApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 40)
    private LicenseDocumentType docType;

    @Column(name = "file_object_key", nullable = false, length = 255)
    private String fileObjectKey;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id")
    private User uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
    }
}
