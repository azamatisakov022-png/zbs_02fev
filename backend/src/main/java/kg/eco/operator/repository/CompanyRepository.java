package kg.eco.operator.repository;

import kg.eco.operator.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByInn(String inn);
    boolean existsByInn(String inn);
}
