package kg.eco.operator.repository;

import kg.eco.operator.entity.ReportItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportItemRepository extends JpaRepository<ReportItem, Long> {
    List<ReportItem> findByReport_Id(Long reportId);
}
