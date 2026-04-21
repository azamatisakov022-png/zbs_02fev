package kg.eco.operator.repository;

import kg.eco.operator.entity.License;
import kg.eco.operator.entity.enums.LicenseType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LicenseRepository extends JpaRepository<License, Long>, JpaSpecificationExecutor<License> {

    Optional<License> findByLicenseNumber(String licenseNumber);

    Page<License> findByApplicantInn(String inn, Pageable pageable);

    Page<License> findByLicenseType(LicenseType licenseType, Pageable pageable);

    @Query("SELECT l FROM License l WHERE l.isPublished = true AND l.isRevoked = false")
    Page<License> findPublished(Pageable pageable);

    @Query("SELECT COUNT(l) FROM License l WHERE l.isPublished = true AND l.isRevoked = false")
    long countPublished();

    @Query("SELECT COUNT(l) FROM License l WHERE l.isRevoked = true")
    long countRevoked();
}
