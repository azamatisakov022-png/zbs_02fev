package kg.eco.operator.dto.request;

import lombok.Data;

@Data
public class RecyclerToggleStatusRequest {

    private String status;
    private String reason;
}
