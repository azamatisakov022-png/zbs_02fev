package kg.eco.operator.repository;

import kg.eco.operator.entity.ProductGroupNorm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductGroupNormRepository extends JpaRepository<ProductGroupNorm, Long> {

    List<ProductGroupNorm> findByProductGroup_IdOrderByYear(Long productGroupId);
}
