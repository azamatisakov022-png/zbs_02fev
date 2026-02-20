package kg.eco.operator.repository;

import kg.eco.operator.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByInn(String inn);
    boolean existsByInn(String inn);
    Optional<User> findFirstByCompany_Id(Long companyId);
}
