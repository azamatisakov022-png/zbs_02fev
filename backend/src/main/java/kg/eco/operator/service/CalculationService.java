package kg.eco.operator.service;

import kg.eco.operator.dto.request.*;
import kg.eco.operator.dto.response.CalculationResponse;
import kg.eco.operator.dto.response.PaginatedResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CalculationService {

    PaginatedResponse<CalculationResponse> getCalculations(
            String inn, int page, int pageSize,
            String search, String status, String periodFrom, String periodTo, String productGroup);

    CalculationResponse getById(Long id);

    CalculationResponse create(String inn, CalculationCreateRequest request);

    CalculationResponse update(Long id, String inn, CalculationCreateRequest request);

    void deleteDraft(Long id, String inn);

    CalculationResponse submit(Long id, String inn);

    CalculationResponse resubmit(Long id, String inn);

    CalculationResponse approve(Long id, String reviewerInn, ReviewRequest request);

    CalculationResponse reject(Long id, String reviewerInn, ReviewRequest request);

    CalculationResponse submitPayment(Long id, String inn, PaymentSubmitRequest request, MultipartFile document);

    CalculationResponse approvePayment(Long id, String reviewerInn);

    CalculationResponse rejectPayment(Long id, String reviewerInn, ReviewRequest request);

    CalculationResponse markAsPaid(Long id, String reviewerInn);

    CalculationResponse copy(Long id, String inn);

    CalculationResponse updateItems(Long id, String inn, UpdateItemsRequest request);

    void updateDocuments(Long id, String inn, MultipartFile[] files);

    long getPendingCount(String inn);

    long getReviewCount();

    List<CalculationResponse> getByCompany(Long companyId);
}
