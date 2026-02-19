package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PayerResponse {

    private Long id;
    private String companyName;
    private String inn;
    private String legalForm;
    private String category;
    private String subcategory;
    private List<String> productGroups;
    private String region;
    private String address;
    private String director;
    private String contactPerson;
    private String phone;
    private String email;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate registrationDate;

    private String reportingStatus;
    private String settlementStatus;
    private String systemStatus;
    private String paymentStatus;

    private List<PayerDeclarationResponse> declarations;
    private List<PayerPaymentResponse> payments;
    private List<PayerDocumentResponse> documents;
    private List<PayerCommentResponse> comments;
    private List<AuditEntryResponse> auditLog;
}
