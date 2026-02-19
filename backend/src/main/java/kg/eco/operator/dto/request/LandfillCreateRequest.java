package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class LandfillCreateRequest {

    @NotBlank
    private String name;

    @NotNull
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

    private List<WasteAcceptanceRequest> wasteAcceptance;
    private InfrastructureRequest infrastructure;
    private EquipmentRequest equipment;
    private MorphologyRequest morphology;

    @Data
    public static class WasteAcceptanceRequest {
        private String wasteType;
        private BigDecimal monthlyVolume;
        private BigDecimal annualVolume;
    }

    @Data
    public static class InfrastructureRequest {
        private Boolean hasWeighStation;
        private Boolean hasFencing;
        private Boolean hasAccessRoad;
        private Boolean hasWaterMonitoring;
        private Boolean hasGasCollection;
        private Boolean hasLeachateSystem;
    }

    @Data
    public static class EquipmentRequest {
        private Integer bulldozers;
        private Integer compactors;
        private Integer excavators;
        private Integer trucks;
    }

    @Data
    public static class MorphologyRequest {
        private BigDecimal organic;
        private BigDecimal paper;
        private BigDecimal plastic;
        private BigDecimal glass;
        private BigDecimal metal;
        private BigDecimal textile;
        private BigDecimal other;
    }
}
