package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CollectionPointResponse {

    private Long id;
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
