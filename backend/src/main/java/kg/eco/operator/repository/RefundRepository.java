package kg.eco.operator.repository;

import kg.eco.operator.entity.Refund;
import kg.eco.operator.entity.enums.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    Page<Refund> findByCompany_Id(Long companyId, Pageable pageable);

    Page<Refund> findByStatus(RefundStatus status, Pageable pageable);

    List<Refund> findByStatus(RefundStatus status);

    Optional<Refund> findByNumber(String number);

    long countByStatus(RefundStatus status);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(r.number, 10) AS long)), 0) FROM Refund r " +
           "WHERE r.number LIKE CONCAT('ВОЗ-', :year, '-%')")
    long findMaxNumberForYear(String year);
}
