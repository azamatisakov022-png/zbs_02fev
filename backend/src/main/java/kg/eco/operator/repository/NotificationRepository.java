package kg.eco.operator.repository;

import kg.eco.operator.entity.Notification;
import kg.eco.operator.entity.enums.RoleEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    List<Notification> findByTargetRoleOrderByCreatedAtDesc(RoleEnum role);

    Page<Notification> findByUser_Id(Long userId, Pageable pageable);

    Page<Notification> findByTargetRole(RoleEnum role, Pageable pageable);

    Page<Notification> findByUser_IdAndIsReadFalse(Long userId, Pageable pageable);

    long countByUser_IdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadByUserId(Long userId);
}
