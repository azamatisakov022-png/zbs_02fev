package kg.eco.operator.repository;

import kg.eco.operator.entity.CollectionPoint;
import kg.eco.operator.entity.enums.CollectionPointStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionPointRepository extends JpaRepository<CollectionPoint, Long> {

    Page<CollectionPoint> findByStatus(CollectionPointStatus status, Pageable pageable);

    Page<CollectionPoint> findByRegion(String region, Pageable pageable);

    List<CollectionPoint> findByRegion(String region);

    List<CollectionPoint> findByStatus(CollectionPointStatus status);

    List<CollectionPoint> findByRegionAndStatus(String region, CollectionPointStatus status);
}
