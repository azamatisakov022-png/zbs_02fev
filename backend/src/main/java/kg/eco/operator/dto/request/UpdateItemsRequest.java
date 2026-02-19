package kg.eco.operator.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class UpdateItemsRequest {

    @NotEmpty(message = "Необходимо указать хотя бы одну позицию")
    @Valid
    private List<ProductItemRequest> items;
}
