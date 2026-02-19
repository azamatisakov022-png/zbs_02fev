package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "ИНН обязателен")
    @Size(min = 14, max = 14, message = "ИНН должен содержать 14 цифр")
    private String inn;

    @NotBlank(message = "Пароль обязателен")
    private String password;
}
