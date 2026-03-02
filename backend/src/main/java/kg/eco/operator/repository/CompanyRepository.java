package kg.eco.operator.repository;

import kg.eco.operator.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByInn(String inn);
    boolean existsByInn(String inn);

    @Query("SELECT DISTINCT c.region FROM Company c WHERE c.region IS NOT NULL ORDER BY c.region")
    List<String> findDistinctRegions();

    @Query("SELECT COUNT(c) FROM Company c WHERE c.region = :region")
    long countByRegion(String region);
}
