package kg.eco.operator.repository;

import kg.eco.operator.entity.Dump;
import kg.eco.operator.entity.enums.DumpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DumpRepository extends JpaRepository<Dump, Long> {

    Page<Dump> findByStatus(DumpStatus status, Pageable pageable);

    Page<Dump> findByRegion(String region, Pageable pageable);

    List<Dump> findByRegion(String region);

    List<Dump> findByStatus(DumpStatus status);

    List<Dump> findByRegionAndStatus(String region, DumpStatus status);
}
