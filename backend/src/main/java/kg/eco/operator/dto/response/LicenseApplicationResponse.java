package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import kg.eco.operator.entity.enums.ApplicantEntity;
import kg.eco.operator.entity.enums.ApplicantType;
import kg.eco.operator.entity.enums.LicenseApplicationStatus;
import kg.eco.operator.entity.enums.LicenseType;
import kg.eco.operator.entity.enums.RejectionReason;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Полный ответ по заявке на лицензию. Используется в ЛК заявителя и сотрудника.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LicenseApplicationResponse {

    private Long id;
    private LicenseApplicationStatus status;

    // заявитель
    private ApplicantType applicantType;
    private Long applicantId;
    private ApplicantEntity applicantEntity;
    private String applicantName;
    private String applicantInn;

    // параметры лицензии
    private LicenseType licenseType;
    private List<String> activityTypes;
    private String legalAddress;
    private String actualAddress;
    private String contactPhone;
    private String contactEmail;
    private String contactPerson;

    // процесс
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submittedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;

    private Integer daysLeft;      // вычисляется: дней до дедлайна (если просрочено — отрицательное)
    private Integer reopenedCount;

    // выезд
    private Boolean siteVisitDone;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate siteVisitDate;
    private String siteVisitInspector;
    private String siteVisitComment;

    // отказ
    private RejectionReason rejectionReason;
    private String rejectionComment;

    // документы
    private List<DocumentItem> documents;

    // платёж (краткая сводка)
    private PaymentSummary payment;

    // выданная лицензия (если APPROVED)
    private Long licenseId;
    private String licenseNumber;
    private Boolean licenseHasDocument;
    private String licenseDocumentFileName;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DocumentItem {
        private Long id;
        private String docType;
        private String fileName;
        private Long fileSize;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime uploadedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PaymentSummary {
        private Long id;
        private String provider;
        private String status;
        private String paymentMethod;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime paidAt;

        private String receiptFileName;
    }
}
