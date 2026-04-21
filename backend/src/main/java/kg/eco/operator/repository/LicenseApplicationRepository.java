package kg.eco.operator.repository;

import kg.eco.operator.entity.LicenseApplication;
import kg.eco.operator.entity.enums.LicenseApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LicenseApplicationRepository
        extends JpaRepository<LicenseApplication, Long>, JpaSpecificationExecutor<LicenseApplication> {

    Page<LicenseApplication> findBySubmittedBy_Id(Long userId, Pageable pageable);

    List<LicenseApplication> findBySubmittedBy_IdOrderByCreatedAtDesc(Long userId);

    Page<LicenseApplication> findByStatus(LicenseApplicationStatus status, Pageable pageable);

    Page<LicenseApplication> findByApplicantInn(String inn, Pageable pageable);

    long countByStatus(LicenseApplicationStatus status);

    @Query("SELECT a FROM LicenseApplication a WHERE a.deadline < :now " +
           "AND a.status IN ('SUBMITTED','UNDER_REVIEW','SITE_VISIT_DONE')")
    List<LicenseApplication> findOverdue(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(a) FROM LicenseApplication a WHERE a.deadline < :now " +
           "AND a.status IN ('SUBMITTED','UNDER_REVIEW','SITE_VISIT_DONE')")
    long countOverdue(@Param("now") LocalDateTime now);
}
