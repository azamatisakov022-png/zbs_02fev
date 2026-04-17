package kg.eco.operator.repository;

import kg.eco.operator.entity.ContestApplication;
import kg.eco.operator.entity.enums.ContestApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestApplicationRepository extends JpaRepository<ContestApplication, Long> {

    List<ContestApplication> findAllByOrderByCreatedAtDesc();

    List<ContestApplication> findByContest_IdOrderByCreatedAtDesc(Long contestId);

    List<ContestApplication> findByStatusOrderByCreatedAtDesc(ContestApplicationStatus status);

    Optional<ContestApplication> findByNumberAndEmailIgnoreCase(String number, String email);

    long countByStatus(ContestApplicationStatus status);

    long countByContest_Id(Long contestId);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(a.number, 10) AS long)), 0) " +
           "FROM ContestApplication a WHERE a.number LIKE CONCAT('КНК-', :year, '-%')")
    long findMaxNumberForYear(String year);
}
