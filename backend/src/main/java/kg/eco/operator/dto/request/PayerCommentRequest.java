package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PayerCommentRequest {

    @NotBlank
    private String text;
}
