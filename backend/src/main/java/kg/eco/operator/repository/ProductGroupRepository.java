package kg.eco.operator.repository;

import kg.eco.operator.entity.ProductGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductGroupRepository extends JpaRepository<ProductGroup, Long> {

    Optional<ProductGroup> findByGroupNumber(Integer groupNumber);

    @Query("SELECT DISTINCT pg FROM ProductGroup pg " +
           "LEFT JOIN FETCH pg.subgroups " +
           "WHERE pg.groupNumber = :groupNumber")
    Optional<ProductGroup> findByGroupNumberWithDetails(Integer groupNumber);

    @Query("SELECT pg FROM ProductGroup pg ORDER BY pg.groupNumber")
    List<ProductGroup> findAllOrderByGroupNumber();

    @Query("SELECT DISTINCT pg FROM ProductGroup pg " +
           "LEFT JOIN FETCH pg.subgroups " +
           "ORDER BY pg.groupNumber")
    List<ProductGroup> findAllWithSubgroups();
}
