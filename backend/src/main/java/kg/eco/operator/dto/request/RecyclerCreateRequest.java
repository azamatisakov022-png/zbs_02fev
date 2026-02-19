package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class RecyclerCreateRequest {

    @NotBlank
    private String companyName;

    private String legalForm;

    @NotBlank
    private String inn;

    private String region;
    private String address;
    private Double latitude;
    private Double longitude;
    private String director;
    private String directorPosition;
    private String contactPerson;
    private String contactPosition;
    private String phone;
    private String email;
    private String licenseNumber;
    private LocalDate licenseDate;
    private LocalDate licenseExpiry;
    private String licenseIssuer;
    private String ecoPassportNumber;
    private LocalDate ecoPassportDate;

    private List<CapacityRequest> capacities;
    private List<String> technologies;
    private String equipment;
    private BigDecimal territoryArea;
    private Integer employeesCount;
    private List<String> certifications;
    private String inspectionStatus;
    private LocalDate lastInspectionDate;
    private String inspectionRemarks;
    private LocalDate nextInspectionDate;
    private BigDecimal volumeCurrentYear;
    private BigDecimal volumePreviousYear;
    private String status;
    private String notes;

    @Data
    public static class CapacityRequest {
        @NotBlank
        private String wasteGroup;
        private String wasteCode;
        @NotNull
        private BigDecimal monthlyCapacity;
        private BigDecimal annualCapacity;
        private BigDecimal currentLoad;
        private String technology;
    }
}
