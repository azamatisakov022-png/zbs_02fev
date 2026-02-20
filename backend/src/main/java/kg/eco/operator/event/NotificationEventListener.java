package kg.eco.operator.event;

import kg.eco.operator.entity.Notification;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.NotificationType;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.repository.NotificationRepository;
import kg.eco.operator.repository.RecyclerRepository;
import kg.eco.operator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final RecyclerRepository recyclerRepository;

    // ─── Calculations ───

    @Async
    @EventListener
    @Transactional
    public void handleCalculationStatus(CalculationStatusEvent event) {
        log.info("Обработка события изменения статуса расчёта: {} -> {}",
                event.getCalculationNumber(), event.getNewStatus());

        switch (event.getNewStatus()) {
            case "submitted", "under_review" -> {
                // 1) Notify the submitter (business user)
                notifyCalcOwner(event, "Расчёт отправлен",
                        "Ваш расчёт " + event.getCalculationNumber() + " отправлен на проверку.",
                        NotificationType.INFO);

                // 2) Notify eco-operator with details
                String company = event.getCompanyName() != null
                        ? " от " + event.getCompanyName() : "";
                String amount = event.getTotalAmount() != null
                        ? " на сумму " + event.getTotalAmount().stripTrailingZeros().toPlainString() + " сом"
                        : "";
                createNotification("Новый входящий расчёт",
                        "Поступил расчёт " + event.getCalculationNumber() + company + amount + ". Требуется проверка.",
                        NotificationType.INFO, null, RoleEnum.ECO_OPERATOR,
                        event.getCalculationId(), "calculation");
            }
            case "approved" -> {
                String amount = event.getTotalAmount() != null
                        ? " Начислено " + event.getTotalAmount().stripTrailingZeros().toPlainString() + " сом."
                        : "";
                notifyCalcOwner(event, "Расчёт одобрен",
                        "Ваш расчёт " + event.getCalculationNumber() + " одобрен." + amount,
                        NotificationType.SUCCESS);
            }
            case "rejected" -> {
                String reason = event.getReviewComment() != null
                        ? " Причина: " + event.getReviewComment() : "";
                notifyCalcOwner(event, "Расчёт отклонён",
                        "Ваш расчёт " + event.getCalculationNumber() + " отклонён." + reason,
                        NotificationType.WARNING);
            }
            case "payment_confirmed" -> {
                notifyCalcOwner(event, "Оплата подтверждена",
                        "Оплата по расчёту " + event.getCalculationNumber() + " подтверждена.",
                        NotificationType.SUCCESS);
            }
            case "payment_rejected" -> {
                String reason = event.getReviewComment() != null
                        ? " Причина: " + event.getReviewComment() : "";
                notifyCalcOwner(event, "Оплата отклонена",
                        "Оплата по расчёту " + event.getCalculationNumber() + " отклонена." + reason,
                        NotificationType.WARNING);
            }
            default -> {
                notifyCalcOwner(event, "Статус расчёта изменён",
                        "Статус расчёта " + event.getCalculationNumber()
                                + " изменён на: " + event.getNewStatus(),
                        NotificationType.STATUS_CHANGE);
            }
        }
    }

    // ─── Refunds ───

    @Async
    @EventListener
    @Transactional
    public void handleRefundStatus(RefundStatusEvent event) {
        log.info("Обработка события изменения статуса возврата: {} -> {}",
                event.getRefundNumber(), event.getNewStatus());

        switch (event.getNewStatus()) {
            case "approved" -> {
                notifyRefundOwner(event, "Возврат одобрен",
                        "Ваша заявка на возврат " + event.getRefundNumber() + " одобрена.",
                        NotificationType.SUCCESS);
            }
            case "rejected" -> {
                String reason = event.getComment() != null
                        ? " Причина: " + event.getComment() : "";
                notifyRefundOwner(event, "Возврат отклонён",
                        "Ваша заявка на возврат " + event.getRefundNumber() + " отклонена." + reason,
                        NotificationType.WARNING);
            }
            default -> {
                notifyRefundOwner(event, "Статус возврата изменён",
                        "Статус заявки " + event.getRefundNumber()
                                + " изменён на: " + event.getNewStatus(),
                        NotificationType.STATUS_CHANGE);
            }
        }
    }

    // ─── Reports ───

    @Async
    @EventListener
    @Transactional
    public void handleReportStatus(ReportStatusEvent event) {
        log.info("Обработка события изменения статуса отчёта: {} -> {}",
                event.getReportNumber(), event.getNewStatus());

        switch (event.getNewStatus()) {
            case "submitted" -> {
                // 1) Notify the submitter (recycler/business user)
                notifyReportOwner(event, "Отчёт отправлен",
                        "Ваш отчёт " + event.getReportNumber() + " отправлен на проверку.",
                        NotificationType.INFO);

                // 2) Notify eco-operator with details
                String company = event.getCompanyName() != null
                        ? " от " + event.getCompanyName() : "";
                createNotification("Новый входящий отчёт",
                        "Поступил отчёт о переработке " + event.getReportNumber() + company + ". Требуется проверка.",
                        NotificationType.INFO, null, RoleEnum.ECO_OPERATOR,
                        event.getReportId(), "report");
            }
            case "approved" -> {
                notifyReportOwner(event, "Отчёт принят",
                        "Ваш отчёт " + event.getReportNumber() + " принят.",
                        NotificationType.SUCCESS);
            }
            case "rejected" -> {
                String reason = event.getComment() != null
                        ? " Причина: " + event.getComment() : "";
                notifyReportOwner(event, "Отчёт отклонён",
                        "Ваш отчёт " + event.getReportNumber() + " отклонён." + reason,
                        NotificationType.WARNING);
            }
            case "revision_requested" -> {
                String comment = event.getComment() != null
                        ? " Комментарий: " + event.getComment() : "";
                notifyReportOwner(event, "Отчёт возвращён на доработку",
                        "Ваш отчёт " + event.getReportNumber() + " возвращён на доработку." + comment,
                        NotificationType.WARNING);
            }
            default -> {
                notifyReportOwner(event, "Статус отчёта изменён",
                        "Статус отчёта " + event.getReportNumber()
                                + " изменён на: " + event.getNewStatus(),
                        NotificationType.STATUS_CHANGE);
            }
        }
    }

    // ─── Helpers ───

    private void notifyCalcOwner(CalculationStatusEvent event, String title, String message,
                                  NotificationType type) {
        if (event.getUserId() != null) {
            userRepository.findById(event.getUserId()).ifPresent(user ->
                    createNotification(title, message, type, user, null,
                            event.getCalculationId(), "calculation"));
        }
    }

    private void notifyRefundOwner(RefundStatusEvent event, String title, String message,
                                    NotificationType type) {
        if (event.getUserId() != null) {
            userRepository.findById(event.getUserId()).ifPresent(user ->
                    createNotification(title, message, type, user, null,
                            event.getRefundId(), "refund"));
        }
    }

    private void notifyReportOwner(ReportStatusEvent event, String title, String message,
                                    NotificationType type) {
        // Try by submitter INN first (business users)
        if (event.getSubmitterInn() != null) {
            userRepository.findByInn(event.getSubmitterInn()).ifPresent(user ->
                    createNotification(title, message, type, user, null,
                            event.getReportId(), "report"));
            return;
        }
        // Fallback: find by recycler
        if (event.getRecyclerId() != null) {
            recyclerRepository.findById(event.getRecyclerId()).ifPresent(recycler ->
                    userRepository.findByInn(recycler.getInn()).ifPresent(user ->
                            createNotification(title, message, type, user, null,
                                    event.getReportId(), "report")));
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
