package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RefundRejectRequest {

    @NotBlank(message = "Причина отклонения обязательна")
    @Size(max = 2000)
    private String reason;
}
