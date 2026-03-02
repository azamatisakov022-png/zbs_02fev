package kg.eco.operator.integration.customs.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CustomsVolumeVerificationResponse {
    private String companyInn;
    private int year;
    private int quarter;
    private boolean hasDiscrepancies;
    private List<VolumeDiscrepancy> discrepancies;

    @Data
    @Builder
    public static class VolumeDiscrepancy {
        private String productGroup;
        private BigDecimal declaredWeight;
        private BigDecimal customsWeight;
        private BigDecimal difference;
        private double differencePercent;
    }
}
