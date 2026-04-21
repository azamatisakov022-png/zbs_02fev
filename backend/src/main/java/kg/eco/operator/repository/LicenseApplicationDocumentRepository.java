package kg.eco.operator.repository;

import kg.eco.operator.entity.LicenseApplicationDocument;
import kg.eco.operator.entity.enums.LicenseDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseApplicationDocumentRepository
        extends JpaRepository<LicenseApplicationDocument, Long> {

    List<LicenseApplicationDocument> findByApplication_IdOrderByUploadedAtAsc(Long applicationId);

    Optional<LicenseApplicationDocument> findByApplication_IdAndDocType(
            Long applicationId, LicenseDocumentType docType);

    long countByApplication_Id(Long applicationId);

    void deleteByApplication_Id(Long applicationId);
}
