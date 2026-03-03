package kg.eco.operator.repository;

import kg.eco.operator.entity.ProductSubgroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSubgroupRepository extends JpaRepository<ProductSubgroup, Long> {

    List<ProductSubgroup> findByProductGroup_GroupNumberOrderBySortOrder(Integer groupNumber);

    @Query("SELECT ps FROM ProductSubgroup ps " +
           "WHERE ps.tnvedCode = :code OR ps.gskpCode = :code")
    List<ProductSubgroup> findByTnvedCodeOrGskpCode(String code);

    @Query("SELECT ps FROM ProductSubgroup ps " +
           "WHERE ps.productGroup.groupNumber = :groupNumber " +
           "AND (LOWER(ps.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR ps.tnvedCode LIKE CONCAT('%', :query, '%') " +
           "OR ps.gskpCode LIKE CONCAT('%', :query, '%')) " +
           "ORDER BY ps.sortOrder")
    List<ProductSubgroup> search(Integer groupNumber, String query);
}
