package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DumpResponse {

    private Long id;
    private String name;
    private String region;
    private String address;
    private Double latitude;
    private Double longitude;
    private BigDecimal area;
    private BigDecimal estimatedVolume;
    private List<String> wasteTypes;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate discoveredDate;

    private List<String> photos;
    private String notes;
}
