package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ContestApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "contest_applications")
public class ContestApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String number;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "document_object_key", nullable = false, length = 255)
    private String documentObjectKey;

    @Column(name = "document_file_name", nullable = false, length = 255)
    private String documentFileName;

    @Column(name = "document_size")
    private Long documentSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContestApplicationStatus status;

    @Column(columnDefinition = "text")
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ContestApplicationStatus.NEW;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
