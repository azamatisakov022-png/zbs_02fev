package kg.eco.operator.repository;

import kg.eco.operator.entity.RecyclerCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RecyclerCapacityRepository extends JpaRepository<RecyclerCapacity, Long> {

    List<RecyclerCapacity> findByRecycler_Id(Long recyclerId);

    List<RecyclerCapacity> findByWasteGroup(String wasteGroup);

    @Query("SELECT rc FROM RecyclerCapacity rc JOIN rc.recycler r " +
           "WHERE r.status = 'ACTIVE' AND rc.wasteGroup = :wasteGroup")
    List<RecyclerCapacity> findByWasteGroupAndRecyclerActive(String wasteGroup);

    @Query("SELECT COALESCE(SUM(rc.monthlyCapacity), 0) FROM RecyclerCapacity rc JOIN rc.recycler r " +
           "WHERE r.status = 'ACTIVE'")
    BigDecimal sumTotalCapacity();

    @Query("SELECT COALESCE(SUM(rc.currentLoad), 0) FROM RecyclerCapacity rc JOIN rc.recycler r " +
           "WHERE r.status = 'ACTIVE'")
    BigDecimal sumTotalLoad();

    @Query("SELECT COALESCE(SUM(rc.monthlyCapacity), 0) FROM RecyclerCapacity rc JOIN rc.recycler r " +
           "WHERE r.status = 'ACTIVE' AND rc.wasteGroup = :wasteGroup")
    BigDecimal sumCapacityByGroup(String wasteGroup);

    @Query("SELECT COALESCE(SUM(rc.currentLoad), 0) FROM RecyclerCapacity rc JOIN rc.recycler r " +
           "WHERE r.status = 'ACTIVE' AND rc.wasteGroup = :wasteGroup")
    BigDecimal sumLoadByGroup(String wasteGroup);
}
