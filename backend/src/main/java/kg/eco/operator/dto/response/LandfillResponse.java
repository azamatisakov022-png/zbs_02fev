package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LandfillResponse {

    private Long id;
    private String name;
    private String type;
    private String region;
    private String address;
    private Double latitude;
    private Double longitude;
    private BigDecimal area;
    private BigDecimal designCapacity;
    private BigDecimal currentVolume;
    private BigDecimal fillPercent;
    private Integer yearOpened;
    private String status;
    private String operator;

    private List<WasteAcceptanceResponse> wasteAcceptance;
    private InfrastructureResponse infrastructure;
    private EquipmentResponse equipment;
    private MorphologyResponse morphology;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WasteAcceptanceResponse {
        private String wasteType;
        private BigDecimal monthlyVolume;
        private BigDecimal annualVolume;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfrastructureResponse {
        private Boolean hasWeighStation;
        private Boolean hasFencing;
        private Boolean hasAccessRoad;
        private Boolean hasWaterMonitoring;
        private Boolean hasGasCollection;
        private Boolean hasLeachateSystem;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentResponse {
        private Integer bulldozers;
        private Integer compactors;
        private Integer excavators;
        private Integer trucks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MorphologyResponse {
        private BigDecimal organic;
        private BigDecimal paper;
        private BigDecimal plastic;
        private BigDecimal glass;
        private BigDecimal metal;
        private BigDecimal textile;
        private BigDecimal other;
    }
}
