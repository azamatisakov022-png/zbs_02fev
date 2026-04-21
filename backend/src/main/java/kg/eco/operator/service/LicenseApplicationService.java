package kg.eco.operator.service;

import kg.eco.operator.dto.request.ApproveLicenseApplicationRequest;
import kg.eco.operator.dto.request.CreateLicenseApplicationRequest;
import kg.eco.operator.dto.request.RejectLicenseApplicationRequest;
import kg.eco.operator.dto.request.SiteVisitRequest;
import kg.eco.operator.dto.request.SubmitLicenseApplicationRequest;
import kg.eco.operator.dto.response.LicenseApplicationResponse;
import kg.eco.operator.dto.response.PaymentIntentResponse;
import kg.eco.operator.entity.enums.LicenseApplicationStatus;
import kg.eco.operator.entity.enums.LicenseDocumentType;
import kg.eco.operator.entity.enums.LicenseType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Бизнес-логика заявок на лицензию.
 * Реализует state machine: DRAFT → PAYMENT_PENDING → SUBMITTED →
 * UNDER_REVIEW → SITE_VISIT_DONE → APPROVED/REJECTED → (reopen) DRAFT.
 */
public interface LicenseApplicationService {

    // ─── Для заявителя (роль BUSINESS, business_type=APPLICANT|BOTH) ───

    LicenseApplicationResponse createDraft(String userInn, CreateLicenseApplicationRequest request);

    LicenseApplicationResponse updateDraft(Long id, String userInn, CreateLicenseApplicationRequest request);

    /** submit: для online — возвращается paymentIntent (заявка в PAYMENT_PENDING).
     *  для offline — заявка сразу в SUBMITTED, оплата подтверждается отдельно. */
    PaymentIntentResponse submit(Long id, String userInn, SubmitLicenseApplicationRequest request);

    LicenseApplicationResponse reopen(Long id, String userInn);

    LicenseApplicationResponse getMyApplication(Long id, String userInn);

    List<LicenseApplicationResponse> getMyApplications(String userInn);

    LicenseApplicationResponse uploadDocument(Long applicationId, String userInn,
                                              LicenseDocumentType docType, MultipartFile file);

    void deleteDocument(Long applicationId, Long docId, String userInn);

    // ─── Для сотрудника МПРЭТН (роли EMPLOYEE, MINISTRY) ───

    List<LicenseApplicationResponse> listAll(LicenseApplicationStatus statusFilter,
                                              LicenseType typeFilter,
                                              Boolean overdueOnly);

    LicenseApplicationResponse getById(Long id);

    LicenseApplicationResponse acceptForReview(Long id, String actorInn);

    LicenseApplicationResponse reject(Long id, String actorInn, RejectLicenseApplicationRequest request);

    LicenseApplicationResponse recordSiteVisit(Long id, String actorInn, SiteVisitRequest request);

    LicenseApplicationResponse approve(Long id, String actorInn, ApproveLicenseApplicationRequest request);

    /** Счётчики по статусам для дашборда сотрудника. */
    Map<String, Long> getStatusCounts();
}
