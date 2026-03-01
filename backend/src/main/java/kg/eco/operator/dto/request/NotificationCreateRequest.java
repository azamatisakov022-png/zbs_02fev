package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationCreateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    @NotBlank(message = "Тип уведомления обязателен")
    private String type;

    @NotBlank(message = "Роль обязательна")
    private String role;
}
