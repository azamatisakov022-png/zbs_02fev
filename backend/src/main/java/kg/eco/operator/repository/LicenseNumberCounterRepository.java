package kg.eco.operator.repository;

import kg.eco.operator.entity.LicenseNumberCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LicenseNumberCounterRepository
        extends JpaRepository<LicenseNumberCounter, Integer> {

    /**
     * Атомарный инкремент счётчика за указанный год.
     * Если строки для года нет — создаёт её со значением 1.
     * Возвращает новое значение счётчика.
     *
     * Используется в транзакции approve() для генерации уникального номера лицензии.
     */
    @Query(value = """
        INSERT INTO license_number_counters (year, counter, updated_at)
        VALUES (:year, 1, NOW())
        ON CONFLICT (year) DO UPDATE
          SET counter = license_number_counters.counter + 1,
              updated_at = NOW()
        RETURNING counter
        """, nativeQuery = true)
    Integer incrementAndGet(@Param("year") Integer year);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<LicenseNumberCounter> findByYear(Integer year);
}
