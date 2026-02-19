package kg.eco.operator.repository;

import kg.eco.operator.entity.Landfill;
import kg.eco.operator.entity.enums.LandfillStatus;
import kg.eco.operator.entity.enums.LandfillType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LandfillRepository extends JpaRepository<Landfill, Long> {

    Page<Landfill> findByStatus(LandfillStatus status, Pageable pageable);

    Page<Landfill> findByRegion(String region, Pageable pageable);

    List<Landfill> findByStatus(LandfillStatus status);

    List<Landfill> findByRegion(String region);

    List<Landfill> findByType(LandfillType type);

    List<Landfill> findByRegionAndStatusAndType(String region, LandfillStatus status, LandfillType type);

    List<Landfill> findByRegionAndStatus(String region, LandfillStatus status);

    List<Landfill> findByRegionAndType(String region, LandfillType type);

    List<Landfill> findByStatusAndType(LandfillStatus status, LandfillType type);

    @Query("SELECT COALESCE(SUM(l.designCapacity), 0) FROM Landfill l WHERE l.status = 'ACTIVE'")
    BigDecimal sumDesignCapacity();

    @Query("SELECT COALESCE(SUM(l.currentVolume), 0) FROM Landfill l WHERE l.status = 'ACTIVE'")
    BigDecimal sumCurrentVolume();

    @Query("SELECT COALESCE(AVG(l.fillPercent), 0) FROM Landfill l WHERE l.status = 'ACTIVE'")
    BigDecimal avgFillPercent();

    @Query("SELECT COUNT(l) FROM Landfill l WHERE l.fillPercent > 100")
    long countOverfilled();
}
