package kg.eco.operator.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContestApplicationStatusCheckRequest {

    @NotBlank
    private String number;

    @NotBlank
    @Email
    private String email;
}
