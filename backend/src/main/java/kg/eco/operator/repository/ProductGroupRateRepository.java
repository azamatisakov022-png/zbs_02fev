package kg.eco.operator.repository;

import kg.eco.operator.entity.ProductGroupRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductGroupRateRepository extends JpaRepository<ProductGroupRate, Long> {

    @Query("SELECT r FROM ProductGroupRate r " +
           "WHERE r.productGroup.id = :productGroupId " +
           "AND r.effectiveFrom <= CURRENT_DATE " +
           "AND (r.effectiveTo IS NULL OR r.effectiveTo >= CURRENT_DATE)")
    Optional<ProductGroupRate> findCurrentByProductGroupId(Long productGroupId);
}
