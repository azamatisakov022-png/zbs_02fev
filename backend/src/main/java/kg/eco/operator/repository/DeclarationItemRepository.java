package kg.eco.operator.repository;

import kg.eco.operator.entity.DeclarationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeclarationItemRepository extends JpaRepository<DeclarationItem, Long> {
    List<DeclarationItem> findByDeclaration_Id(Long declarationId);
}
