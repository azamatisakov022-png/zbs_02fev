package kg.eco.operator.dto.response;

import kg.eco.operator.entity.Company;
import lombok.Builder;
import lombok.Data;

/**
 * Профиль компании текущего пользователя — для предзаполнения форм
 * (мастер подачи заявки на лицензию, страница профиля и т.п.).
 *
 * Возвращается endpoint'ом GET /companies/my.
 */
@Data
@Builder
public class CompanyResponse {
    private Long id;
    private String companyName;
    private String inn;
    private String legalForm;     // "ОсОО", "ОАО", "ИП", "Иная" — текстом, как в БД
    private String region;
    private String address;
    private String director;
    private String contactPerson;
    private String phone;
    private String email;

    public static CompanyResponse from(Company c) {
        return CompanyResponse.builder()
                .id(c.getId())
                .companyName(c.getCompanyName())
                .inn(c.getInn())
                .legalForm(c.getLegalForm())
                .region(c.getRegion())
                .address(c.getAddress())
                .director(c.getDirector())
                .contactPerson(c.getContactPerson())
                .phone(c.getPhone())
                .email(c.getEmail())
                .build();
    }
}
