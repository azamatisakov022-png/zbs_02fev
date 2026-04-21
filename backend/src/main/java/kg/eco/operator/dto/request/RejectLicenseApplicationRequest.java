package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotNull;
import kg.eco.operator.entity.enums.RejectionReason;
import lombok.Data;

/**
 * Отклонение заявки сотрудником МПРЭТН.
 * Причина — только из закрытого перечня ст. 14 Закона № 195.
 * Свободный текст только в опциональном уточнении.
 */
@Data
public class RejectLicenseApplicationRequest {

    @NotNull
    private RejectionReason reason;

    /** Опциональное уточнение от сотрудника. */
    private String comment;
}
