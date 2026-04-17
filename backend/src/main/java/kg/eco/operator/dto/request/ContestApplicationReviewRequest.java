package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContestApplicationReviewRequest {

    /** Целевой статус: under_review | approved | rejected */
    @NotBlank
    private String status;

    /** Комментарий сотрудника (обязателен при rejected, желателен иначе) */
    private String comment;
}
