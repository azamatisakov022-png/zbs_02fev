package kg.eco.operator.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import kg.eco.operator.entity.enums.ApplicantType;
import kg.eco.operator.entity.enums.BusinessType;
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

    /**
     * Тип бизнес-пользователя: PAYER | APPLICANT | BOTH.
     * Если не указан — по умолчанию PAYER (существующее поведение).
     * Определяется фронтом на основании activityType (importer/producer/both → PAYER,
     * recycler → APPLICANT, смешанный → BOTH).
     */
    private BusinessType businessType;

    /**
     * Подтип заявителя на лицензию: RECYCLER | LANDFILL | COLLECTION_POINT | OTHER.
     * Передаётся только когда businessType ∈ {APPLICANT, BOTH}.
     * Для PAYER оставляется null. Бэк не валидирует обязательность —
     * пользователь сможет дозаполнить позже в настройках профиля.
     */
    private ApplicantType applicantType;

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный формат email")
    private String email;

    private String phone;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, message = "Пароль должен содержать минимум 6 символов")
    private String password;
}
