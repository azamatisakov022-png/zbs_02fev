package kg.eco.operator.repository;

import kg.eco.operator.entity.Declaration;
import kg.eco.operator.entity.enums.DeclarationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeclarationRepository extends JpaRepository<Declaration, Long> {
    Page<Declaration> findByCompany_Id(Long companyId, Pageable pageable);
    Page<Declaration> findByStatus(DeclarationStatus status, Pageable pageable);
    Optional<Declaration> findByNumber(String number);
    Optional<Declaration> findByCompany_IdAndYear(Long companyId, Integer year);
}
