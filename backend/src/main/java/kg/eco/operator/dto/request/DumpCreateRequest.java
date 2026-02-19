package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class DumpCreateRequest {

    @NotBlank
    private String name;

    private String region;
    private String address;
    private Double latitude;
    private Double longitude;
    private BigDecimal area;
    private BigDecimal estimatedVolume;
    private List<String> wasteTypes;
    private String status;
    private LocalDate discoveredDate;
    private List<String> photos;
    private String notes;
}
