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
public class CalculationResponse {

    private Long id;
    private String number;
    private Long companyId;
    private String companyName;
    private String companyInn;
    private String period;
    private String quarter;
    private String documentType;
    private String documentNumber;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate documentDate;

    private List<ProductItemResponse> items;
    private BigDecimal totalAmount;
    private String status;

    private PaymentResponse payment;
    private List<DocumentResponse> documents;

    private String reviewComment;
    private String reviewedBy;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime reviewedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submittedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
