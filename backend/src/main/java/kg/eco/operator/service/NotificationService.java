package kg.eco.operator.service;

import kg.eco.operator.dto.request.NotificationCreateRequest;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.NotificationResponse;
import kg.eco.operator.dto.response.SuccessResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getAll(String userInn, Boolean unreadOnly);

    NotificationResponse create(NotificationCreateRequest request);

    SuccessResponse markAsRead(Long id);

    SuccessResponse markAllAsRead(String userInn);

    SuccessResponse delete(Long id);

    CountResponse getUnreadCount(String userInn);

    List<NotificationResponse> getByRole(String role);
}
