package kg.eco.operator.repository;

import kg.eco.operator.entity.LicensePayment;
import kg.eco.operator.entity.enums.LicensePaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LicensePaymentRepository extends JpaRepository<LicensePayment, Long> {

    /**
     * Активный (PENDING | SUCCESS | MANUAL_CONFIRMED) платёж по заявке.
     * Enforced частичным уникальным индексом в БД — максимум один на заявку.
     */
    @Query("SELECT p FROM LicensePayment p WHERE p.application.id = :appId " +
           "AND p.status IN ('PENDING','SUCCESS','MANUAL_CONFIRMED')")
    Optional<LicensePayment> findActiveByApplicationId(@Param("appId") Long applicationId);

    Optional<LicensePayment> findByProviderAndProviderOrderId(String provider, String providerOrderId);

    List<LicensePayment> findByApplication_IdOrderByCreatedAtDesc(Long applicationId);

    List<LicensePayment> findByStatus(LicensePaymentStatus status);
}
