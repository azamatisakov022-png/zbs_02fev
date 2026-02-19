package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SuccessResponse {

    private boolean success;
    private String message;

    public static SuccessResponse ok(String message) {
        return new SuccessResponse(true, message);
    }
}
