package kg.eco.operator.event;

import kg.eco.operator.entity.Notification;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.NotificationType;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.repository.NotificationRepository;
import kg.eco.operator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Async
    @EventListener
    @Transactional
    public void handleCalculationStatus(CalculationStatusEvent event) {
        log.info("Обработка события изменения статуса расчёта: {} -> {}",
                event.getCalculationNumber(), event.getNewStatus());

        String title;
        String message;
        NotificationType type;

        switch (event.getNewStatus()) {
            case "approved" -> {
                title = "Расчёт одобрен";
                message = "Расчёт " + event.getCalculationNumber() + " одобрен.";
                type = NotificationType.SUCCESS;
            }
            case "rejected" -> {
                title = "Расчёт отклонён";
                message = "Расчёт " + event.getCalculationNumber() + " отклонён."
                        + (event.getReviewComment() != null ? " Причина: " + event.getReviewComment() : "");
                type = NotificationType.WARNING;
            }
            case "submitted", "under_review" -> {
                title = "Новый расчёт на рассмотрении";
                message = "Расчёт " + event.getCalculationNumber() + " подан на рассмотрение.";
                type = NotificationType.INFO;
                // Notify eco-operator
                createNotification(title, message, type, null, RoleEnum.ECO_OPERATOR,
                        event.getCalculationId(), "calculation");
                return;
            }
            case "payment_confirmed" -> {
                title = "Оплата подтверждена";
                message = "Оплата по расчёту " + event.getCalculationNumber() + " подтверждена.";
                type = NotificationType.SUCCESS;
            }
            case "payment_rejected" -> {
                title = "Оплата отклонена";
                message = "Оплата по расчёту " + event.getCalculationNumber() + " отклонена."
                        + (event.getReviewComment() != null ? " Причина: " + event.getReviewComment() : "");
                type = NotificationType.WARNING;
            }
            default -> {
                title = "Статус расчёта изменён";
                message = "Статус расчёта " + event.getCalculationNumber()
                        + " изменён на: " + event.getNewStatus();
                type = NotificationType.STATUS_CHANGE;
            }
        }

        // Notify the business user (owner of calculation)
        if (event.getUserId() != null) {
            Optional<User> user = userRepository.findById(event.getUserId());
            user.ifPresent(u -> createNotification(title, message, type, u, null,
                    event.getCalculationId(), "calculation"));
        }
    }

    @Async
    @EventListener
    @Transactional
    public void handleRefundStatus(RefundStatusEvent event) {
        log.info("Обработка события изменения статуса возврата: {} -> {}",
                event.getRefundNumber(), event.getNewStatus());

        String title;
        String message;
        NotificationType type;

        switch (event.getNewStatus()) {
            case "approved" -> {
                title = "Возврат одобрен";
                message = "Заявка на возврат " + event.getRefundNumber() + " одобрена.";
                type = NotificationType.SUCCESS;
            }
            case "rejected" -> {
                title = "Возврат отклонён";
                message = "Заявка на возврат " + event.getRefundNumber() + " отклонена."
                        + (event.getComment() != null ? " Причина: " + event.getComment() : "");
                type = NotificationType.WARNING;
            }
            default -> {
                title = "Статус возврата изменён";
                message = "Статус заявки " + event.getRefundNumber()
                        + " изменён на: " + event.getNewStatus();
                type = NotificationType.STATUS_CHANGE;
            }
        }

        if (event.getUserId() != null) {
            Optional<User> user = userRepository.findById(event.getUserId());
            user.ifPresent(u -> createNotification(title, message, type, u, null,
                    event.getRefundId(), "refund"));
        }
    }

    private void createNotification(String title, String message, NotificationType type,
                                     User user, RoleEnum targetRole,
                                     Long referenceId, String referenceType) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setUser(user);
        notification.setTargetRole(targetRole);
        notification.setIsRead(false);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notificationRepository.save(notification);
    }
}
