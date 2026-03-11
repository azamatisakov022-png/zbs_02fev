package kg.eco.operator.repository;

import kg.eco.operator.entity.DetectedCompany;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DetectedCompanyRepository extends JpaRepository<DetectedCompany, Long> {

    boolean existsByInn(String inn);

    Optional<DetectedCompany> findByInn(String inn);

    Page<DetectedCompany> findByStatus(String status, Pageable pageable);

    Page<DetectedCompany> findBySource(String source, Pageable pageable);

    @Query(value = "SELECT * FROM detected_companies d WHERE " +
           "(:status IS NULL OR d.status = CAST(:status AS VARCHAR)) AND " +
           "(:source IS NULL OR d.source = CAST(:source AS VARCHAR)) AND " +
           "(:search IS NULL OR LOWER(d.company_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')) OR d.inn LIKE CONCAT('%', CAST(:search AS VARCHAR), '%'))",
           countQuery = "SELECT COUNT(*) FROM detected_companies d WHERE " +
           "(:status IS NULL OR d.status = CAST(:status AS VARCHAR)) AND " +
           "(:source IS NULL OR d.source = CAST(:source AS VARCHAR)) AND " +
           "(:search IS NULL OR LOWER(d.company_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')) OR d.inn LIKE CONCAT('%', CAST(:search AS VARCHAR), '%'))",
           nativeQuery = true)
    Page<DetectedCompany> findWithFilters(
            @Param("status") String status,
            @Param("source") String source,
            @Param("search") String search,
            Pageable pageable);

    long countByStatus(String status);
}
