package kg.eco.operator.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import kg.eco.operator.entity.enums.PayerCategory;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "ИНН обязателен")
    @Size(min = 14, max = 14, message = "ИНН должен содержать 14 цифр")
    private String inn;

    @NotBlank(message = "Название компании обязательно")
    private String companyName;

    @NotBlank(message = "Организационно-правовая форма обязательна")
    private String legalForm;

    private PayerCategory category;

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный формат email")
    private String email;

    private String phone;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, message = "Пароль должен содержать минимум 6 символов")
    private String password;
}
