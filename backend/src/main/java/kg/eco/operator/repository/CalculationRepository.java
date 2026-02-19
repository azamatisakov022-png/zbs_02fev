package kg.eco.operator.repository;

import kg.eco.operator.entity.Calculation;
import kg.eco.operator.entity.enums.CalculationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalculationRepository extends JpaRepository<Calculation, Long>, JpaSpecificationExecutor<Calculation> {
    Page<Calculation> findByCompany_Id(Long companyId, Pageable pageable);
    Page<Calculation> findByStatus(CalculationStatus status, Pageable pageable);
    Page<Calculation> findByCompany_IdAndStatus(Long companyId, CalculationStatus status, Pageable pageable);
    Optional<Calculation> findByNumber(String number);
    long countByStatus(CalculationStatus status);
    long countByStatusIn(List<CalculationStatus> statuses);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(c.number, 4, 4) AS int)), 0) FROM Calculation c WHERE c.number LIKE :prefix")
    int findMaxNumberByPrefix(String prefix);
}
