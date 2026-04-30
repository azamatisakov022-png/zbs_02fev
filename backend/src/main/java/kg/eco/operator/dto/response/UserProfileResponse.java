package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String inn;
    private String companyName;
    private String role;
    private String email;
    private String phone;

    /** Для role='business': payer | applicant | both. Для остальных ролей — null. */
    private String businessType;

    /**
     * Подтип заявителя на лицензию: recycler | landfill | collection_point | other.
     * Заполнен только если businessType ∈ {applicant, both} и пользователь
     * указал тип. Иначе — null.
     */
    private String applicantType;
}
