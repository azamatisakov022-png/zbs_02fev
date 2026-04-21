package kg.eco.operator.repository;

import kg.eco.operator.entity.LicenseApplicationRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseApplicationRevisionRepository
        extends JpaRepository<LicenseApplicationRevision, Long> {

    List<LicenseApplicationRevision> findByApplication_IdOrderByRevisionNumberAsc(Long applicationId);

    Optional<LicenseApplicationRevision> findTopByApplication_IdOrderByRevisionNumberDesc(Long applicationId);

    long countByApplication_Id(Long applicationId);
}
