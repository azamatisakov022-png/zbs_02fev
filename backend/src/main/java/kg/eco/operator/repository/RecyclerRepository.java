package kg.eco.operator.repository;

import kg.eco.operator.entity.Recycler;
import kg.eco.operator.entity.enums.RecyclerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecyclerRepository extends JpaRepository<Recycler, Long>, JpaSpecificationExecutor<Recycler> {

    Optional<Recycler> findByInn(String inn);

    Page<Recycler> findByStatus(RecyclerStatus status, Pageable pageable);

    Page<Recycler> findByRegion(String region, Pageable pageable);

    List<Recycler> findByStatus(RecyclerStatus status);

    @Query("SELECT COUNT(r) FROM Recycler r WHERE r.status = 'ACTIVE'")
    long countActive();

    @Query("SELECT COUNT(r) FROM Recycler r WHERE r.status = 'SUSPENDED'")
    long countSuspended();
}
