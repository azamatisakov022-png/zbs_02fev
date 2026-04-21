package kg.eco.operator.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * Фиксация факта выезда на объект заявителя.
 * Обязательный этап перед одобрением лицензии.
 */
@Data
public class SiteVisitRequest {

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotBlank
    @Size(max = 200)
    private String inspector;

    private String comment;
}
