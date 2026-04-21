package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.LicensePaymentMethod;
import kg.eco.operator.entity.enums.LicensePaymentStatus;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Платёж госпошлины за лицензию.
 * Маппится на таблицу license_payments (миграция V20).
 *
 * Названа LicensePayment (а не Payment), чтобы не конфликтовать с существующей
 * сущностью Payment, которая хранит утильсборные платежи.
 *
 * Одна заявка = максимум один активный платёж (enforced частичным UNIQUE индексом
 * в БД: idx_lpay_app_active).
 */
@Data
@Entity
@Table(name = "license_payments")
public class LicensePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private LicenseApplication application;

    /** Код провайдера: MOCK|ELDIK|GNS|AGGREGATOR|MANUAL. */
    @Column(nullable = false, length = 30)
    private String provider;

    /** ID заказа у провайдера. Null для MANUAL. */
    @Column(name = "provider_order_id", length = 100)
    private String providerOrderId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "KGS";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LicensePaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private LicensePaymentMethod paymentMethod;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "receipt_url", columnDefinition = "TEXT")
    private String receiptUrl;

    @Column(name = "manual_receipt_object_key", length = 255)
    private String manualReceiptObjectKey;

    @Column(name = "manual_receipt_file_name", length = 255)
    private String manualReceiptFileName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manual_confirmed_by_id")
    private User manualConfirmedBy;

    @Column(name = "manual_confirmed_at")
    private LocalDateTime manualConfirmedAt;

    /** Произвольные данные от провайдера (сырой webhook и т.п.). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (currency == null) currency = "KGS";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
