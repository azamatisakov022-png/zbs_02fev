package kg.eco.operator.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * Финальное одобрение заявки — создание лицензии.
 * Срок действия указывается вручную, бессрочных лицензий нет.
 */
@Data
public class ApproveLicenseApplicationRequest {

    @NotNull
    @Future
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate validUntil;
}
