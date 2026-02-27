package kg.eco.operator.service.impl;

import kg.eco.operator.dto.response.UserProfileResponse;
import kg.eco.operator.entity.NotificationTemplate;
import kg.eco.operator.entity.enums.NotificationType;
import kg.eco.operator.repository.*;
import kg.eco.operator.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final NotificationTemplateRepository templateRepository;
    private final RateRepository rateRepository;
    private final RecyclingNormRepository recyclingNormRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<UserProfileResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserProfileResponse.builder()
                        .id(user.getId())
                        .inn(user.getInn())
                        .companyName(user.getCompanyName())
                        .role(mapRole(user.getRole()))
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getNotificationTemplates() {
        return templateRepository.findAll().stream()
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", t.getId());
                    map.put("name", t.getCode());
                    map.put("subject", t.getTitle());
                    map.put("bodyTemplate", t.getMessageTemplate());
                    map.put("channel", "internal");
                    map.put("triggerEvent", t.getCode());
                    map.put("isActive", true);
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createNotificationTemplate(Map<String, Object> request) {
        NotificationTemplate template = new NotificationTemplate();
        template.setCode((String) request.getOrDefault("name", "custom_" + System.currentTimeMillis()));
        template.setTitle((String) request.getOrDefault("subject", ""));
        template.setMessageTemplate((String) request.getOrDefault("bodyTemplate", ""));
        template.setType(NotificationType.INFO);
        template = templateRepository.save(template);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", template.getId());
        result.put("name", template.getCode());
        result.put("subject", template.getTitle());
        result.put("bodyTemplate", template.getMessageTemplate());
        return result;
    }

    @Override
    public List<Map<String, Object>> getRates() {
        return rateRepository.findAll().stream()
                .map(rate -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("productGroup", rate.getCategory().getName());
                    map.put("productSubgroup", rate.getCategory().getDescription());
                    map.put("unit", rate.getCategory().getUnit() != null ? rate.getCategory().getUnit() : "тонн");
                    map.put("rate", rate.getRatePerUnit());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateRates(List<Map<String, Object>> rates) {
        for (Map<String, Object> rateData : rates) {
            String productGroup = (String) rateData.get("productGroup");
            Number rateValue = (Number) rateData.get("rate");

            if (productGroup != null && rateValue != null) {
                var categories = categoryRepository.findAll().stream()
                        .filter(c -> c.getName().equals(productGroup))
                        .toList();

                for (var category : categories) {
                    var existingRates = rateRepository.findByCategory_Id(category.getId());
                    for (var rate : existingRates) {
                        rate.setRatePerUnit(java.math.BigDecimal.valueOf(rateValue.doubleValue()));
                        rateRepository.save(rate);
                    }
                }
            }
        }
    }

    @Override
    public List<Map<String, Object>> getRecyclingNorms() {
        return recyclingNormRepository.findAll().stream()
                .map(norm -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("wasteGroup", norm.getCategory().getName());
                    map.put("year", norm.getYear());
                    map.put("normPercent", norm.getNormPercent());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getSettings() {
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("systemName", "АИС «ГП Эко Оператор»");
        settings.put("defaultCurrency", "KGS");
        settings.put("maxFileSize", "50MB");
        settings.put("currentYear", java.time.LocalDate.now().getYear());
        return settings;
    }

    @Override
    public void updateSettings(Map<String, Object> settings) {
        // TODO: persist to a settings table
    }

    private String mapRole(kg.eco.operator.entity.enums.RoleEnum role) {
        if (role == null) return null;
        return role.getValue();
    }
}
