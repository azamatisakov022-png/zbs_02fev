package kg.eco.operator.repository;

import kg.eco.operator.entity.Contest;
import kg.eco.operator.entity.enums.ContestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {

    List<Contest> findByStatus(ContestStatus status);

    List<Contest> findByStatusAndDeadlineAfterOrderByDeadlineAsc(
            ContestStatus status, LocalDateTime now);

    List<Contest> findAllByOrderByCreatedAtDesc();
}
