package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "detected_companies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectedCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inn", nullable = false, length = 14)
    private String inn;

    @Column(name = "company_name", length = 500)
    private String companyName;

    @Column(name = "legal_form", length = 100)
    private String legalForm;

    @Column(name = "legal_address", columnDefinition = "TEXT")
    private String legalAddress;

    @Column(name = "director", length = 200)
    private String director;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "okpo_code", length = 20)
    private String okpoCode;

    @Column(name = "oked_codes", columnDefinition = "TEXT")
    private String okedCodes;

    // gts, gns, self
    @Column(name = "source", nullable = false, length = 20)
    private String source;

    // new, notified, in_progress, registered, rejected
    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "tnved_codes", columnDefinition = "TEXT")
    private String tnvedCodes;

    @Column(name = "estimated_mass", precision = 12, scale = 3)
    private BigDecimal estimatedMass;

    @Column(name = "gns_status", length = 20)
    private String gnsStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_employee_id")
    private User assignedEmployee;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
