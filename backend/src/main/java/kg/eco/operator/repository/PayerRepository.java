package kg.eco.operator.repository;

import kg.eco.operator.entity.Payer;
import kg.eco.operator.entity.enums.PayerCategory;
import kg.eco.operator.entity.enums.SettlementStatus;
import kg.eco.operator.entity.enums.SystemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayerRepository extends JpaRepository<Payer, Long>, JpaSpecificationExecutor<Payer> {

    Page<Payer> findByCategory(PayerCategory category, Pageable pageable);

    Page<Payer> findByCompany_Region(String region, Pageable pageable);

    Optional<Payer> findByCompany_Id(Long companyId);

    @Query("SELECT COUNT(p) FROM Payer p WHERE p.systemStatus = 'ACTIVE'")
    long countActive();

    @Query("SELECT COUNT(p) FROM Payer p WHERE p.systemStatus = 'SUSPENDED'")
    long countSuspended();

    @Query("SELECT COUNT(p) FROM Payer p WHERE p.settlementStatus = 'DEBT'")
    long countWithDebt();
}
