package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Счётчик для атомарной генерации номеров лицензий.
 * Одна строка на год. Используется внутри транзакции approve()
 * через нативный SQL с ON CONFLICT DO UPDATE ... RETURNING counter.
 *
 * Маппится на таблицу license_number_counters (миграция V19).
 */
@Data
@Entity
@Table(name = "license_number_counters")
public class LicenseNumberCounter {

    @Id
    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer counter = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }
}
