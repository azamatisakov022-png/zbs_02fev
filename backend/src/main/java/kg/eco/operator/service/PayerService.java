package kg.eco.operator.service;

import kg.eco.operator.dto.request.PayerCommentRequest;
import kg.eco.operator.dto.response.PaginatedResponse;
import kg.eco.operator.dto.response.PayerResponse;
import kg.eco.operator.dto.response.PayerStatsResponse;
import kg.eco.operator.dto.response.SuccessResponse;
import org.springframework.web.multipart.MultipartFile;

public interface PayerService {

    PaginatedResponse<PayerResponse> getAll(int page, int pageSize, String search,
                                             String region, String category,
                                             String systemStatus, String settlementStatus);

    PayerResponse getById(Long id);

    SuccessResponse addComment(Long id, String authorInn, PayerCommentRequest request);

    SuccessResponse addDocument(Long id, MultipartFile file, String type);

    PayerStatsResponse getStats();
}
