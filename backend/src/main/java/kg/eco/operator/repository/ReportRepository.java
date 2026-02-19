package kg.eco.operator.repository;

import kg.eco.operator.entity.Report;
import kg.eco.operator.entity.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByRecycler_Id(Long recyclerId, Pageable pageable);
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    Optional<Report> findByNumber(String number);
}
