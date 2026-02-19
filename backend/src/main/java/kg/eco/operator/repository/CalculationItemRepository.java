package kg.eco.operator.repository;

import kg.eco.operator.entity.CalculationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalculationItemRepository extends JpaRepository<CalculationItem, Long> {
    List<CalculationItem> findByCalculation_Id(Long calculationId);
}
