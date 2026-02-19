package kg.eco.operator.repository;

import kg.eco.operator.entity.RecyclingNorm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecyclingNormRepository extends JpaRepository<RecyclingNorm, Long> {
    List<RecyclingNorm> findByYear(Integer year);
    Optional<RecyclingNorm> findByCategory_IdAndYear(Long categoryId, Integer year);
}
