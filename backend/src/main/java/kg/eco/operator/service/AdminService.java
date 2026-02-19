package kg.eco.operator.service;

import kg.eco.operator.dto.response.UserProfileResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface AdminService {

    List<UserProfileResponse> getUsers();

    List<Map<String, Object>> getNotificationTemplates();

    Map<String, Object> createNotificationTemplate(Map<String, Object> request);

    List<Map<String, Object>> getRates();

    void updateRates(List<Map<String, Object>> rates);

    List<Map<String, Object>> getRecyclingNorms();

    Map<String, Object> getSettings();

    void updateSettings(Map<String, Object> settings);
}
