package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecyclerResponse {

    private Long id;
    private String companyName;
    private String legalForm;
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

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate licenseDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate licenseExpiry;

    private String licenseIssuer;
    private String ecoPassportNumber;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ecoPassportDate;

    private List<RecyclerCapacityResponse> capacities;
    private List<String> technologies;
    private String equipment;
    private BigDecimal territoryArea;
    private Integer employeesCount;
    private List<String> certifications;
    private String inspectionStatus;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastInspectionDate;

    private String inspectionRemarks;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextInspectionDate;

    private BigDecimal volumeCurrentYear;
    private BigDecimal volumePreviousYear;
    private String status;
    private String suspensionReason;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastUpdated;

    private String notes;

    private List<RecyclerDocumentResponse> documents;
}
