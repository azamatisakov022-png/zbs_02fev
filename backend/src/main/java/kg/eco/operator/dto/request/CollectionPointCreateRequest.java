package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CollectionPointCreateRequest {

    @NotBlank
    private String name;

    private String region;
    private String address;
    private Double latitude;
    private Double longitude;
    private List<String> wasteTypes;
    private String operatingHours;
    private String contactPhone;
    private String operator;
    private String status;
}
