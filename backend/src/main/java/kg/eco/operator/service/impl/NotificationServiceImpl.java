package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.NotificationMapper;
import kg.eco.operator.dto.request.NotificationCreateRequest;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.NotificationResponse;
import kg.eco.operator.dto.response.SuccessResponse;
import kg.eco.operator.entity.Notification;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.NotificationType;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.NotificationRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public List<NotificationResponse> getAll(String userInn, Boolean unreadOnly) {
        User user = findUserByInn(userInn);
        String userRole = roleToString(user.getRole());

        // User-specific notifications
        List<Notification> userNotifications;
        if (Boolean.TRUE.equals(unreadOnly)) {
            userNotifications = notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        } else {
            userNotifications = notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        }

        // Role-targeted notifications (e.g., ECO_OPERATOR sees all role-based notifications)
        List<Notification> roleNotifications = List.of();
        if (user.getRole() != null) {
            roleNotifications = notificationRepository.findByTargetRoleOrderByCreatedAtDesc(user.getRole());
            if (Boolean.TRUE.equals(unreadOnly)) {
                roleNotifications = roleNotifications.stream()
                        .filter(n -> !Boolean.TRUE.equals(n.getIsRead()))
                        .toList();
            }
        }

        // Merge and sort by createdAt desc
        List<Notification> all = new ArrayList<>(userNotifications);
        all.addAll(roleNotifications);
        all.sort(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        List<NotificationResponse> responses = notificationMapper.toResponseList(all);
        // Set role for user-specific notifications (where targetRole is null)
        responses.forEach(r -> {
            if (r.getRole() == null) r.setRole(userRole);
        });

        return responses;
    }

    @Override
    @Transactional
    public NotificationResponse create(NotificationCreateRequest request) {
        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());

        try {
            notification.setType(NotificationType.valueOf(request.getType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            notification.setType(NotificationType.INFO);
        }

        RoleEnum targetRole = mapRole(request.getRole());
        notification.setTargetRole(targetRole);
        notification.setIsRead(false);

        notification = notificationRepository.save(notification);
        return notificationMapper.toResponse(notification);
    }

    @Override
    @Transactional
    public SuccessResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Уведомление не найдено: " + id));

        notification.setIsRead(true);
        notificationRepository.save(notification);
        return SuccessResponse.ok("Прочитано");
    }

    @Override
    @Transactional
    public SuccessResponse markAllAsRead(String userInn) {
        User user = findUserByInn(userInn);
        notificationRepository.markAllAsReadByUserId(user.getId());
        // Also mark role-targeted notifications as read
        if (user.getRole() != null) {
            notificationRepository.findByTargetRoleOrderByCreatedAtDesc(user.getRole()).stream()
                    .filter(n -> !Boolean.TRUE.equals(n.getIsRead()))
                    .forEach(n -> {
                        n.setIsRead(true);
                        notificationRepository.save(n);
                    });
        }
        return SuccessResponse.ok("Все прочитаны");
    }

    @Override
    @Transactional
    public SuccessResponse delete(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Уведомление не найдено: " + id);
        }
        notificationRepository.deleteById(id);
        return SuccessResponse.ok("Удалено");
    }

    @Override
    public CountResponse getUnreadCount(String userInn) {
        User user = findUserByInn(userInn);
        long userCount = notificationRepository.countByUser_IdAndIsReadFalse(user.getId());
        long roleCount = 0;
        if (user.getRole() != null) {
            roleCount = notificationRepository.findByTargetRoleOrderByCreatedAtDesc(user.getRole()).stream()
                    .filter(n -> !Boolean.TRUE.equals(n.getIsRead()))
                    .count();
        }
        return new CountResponse(userCount + roleCount);
    }

    @Override
    public List<NotificationResponse> getByRole(String role) {
        RoleEnum roleEnum = mapRole(role);
        if (roleEnum == null) {
            return List.of();
        }

        List<Notification> notifications = notificationRepository
                .findByTargetRoleOrderByCreatedAtDesc(roleEnum);
        return notificationMapper.toResponseList(notifications);
    }

    // ─── Helpers ───

    private User findUserByInn(String inn) {
        return userRepository.findByInn(inn)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
    }

    private String roleToString(RoleEnum role) {
        if (role == null) return null;
        return role.getValue();
    }

    private RoleEnum mapRole(String role) {
        if (role == null) return null;
        return switch (role.toLowerCase()) {
            case "business" -> RoleEnum.BUSINESS;
            case "eco-operator", "eco_operator" -> RoleEnum.ECO_OPERATOR;
            case "employee" -> RoleEnum.EMPLOYEE;
            case "admin" -> RoleEnum.ADMIN;
            case "ministry" -> RoleEnum.MINISTRY;
            default -> null;
        };
    }
}
