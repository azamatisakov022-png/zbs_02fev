package kg.eco.operator.repository;

import kg.eco.operator.entity.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RateRepository extends JpaRepository<Rate, Long> {
    List<Rate> findByCategory_Id(Long categoryId);
    List<Rate> findByCategory_GroupNumber(Integer groupNumber);
}
