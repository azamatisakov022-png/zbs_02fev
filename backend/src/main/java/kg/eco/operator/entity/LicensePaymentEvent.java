package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Лог события от платёжного провайдера (webhook).
 * Логируем все входящие, включая невалидные и неопознанные — для аудита
 * и защиты от подделки.
 *
 * Маппится на таблицу license_payment_events (миграция V20).
 */
@Data
@Entity
@Table(name = "license_payment_events")
public class LicensePaymentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private LicensePayment payment;

    @Column(nullable = false, length = 30)
    private String provider;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_payload", nullable = false, columnDefinition = "jsonb")
    private String rawPayload;

    @Column(columnDefinition = "TEXT")
    private String signature;

    @Column(name = "is_signature_valid")
    private Boolean isSignatureValid;

    @Column(name = "processing_error", columnDefinition = "TEXT")
    private String processingError;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) receivedAt = LocalDateTime.now();
    }
}
