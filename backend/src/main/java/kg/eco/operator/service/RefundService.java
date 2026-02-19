package kg.eco.operator.service;

import kg.eco.operator.dto.request.RefundCreateRequest;
import kg.eco.operator.dto.request.RefundRejectRequest;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.RefundResponse;

import java.util.List;

public interface RefundService {

    List<RefundResponse> getAll(String status);

    RefundResponse create(String userInn, RefundCreateRequest request);

    RefundResponse getById(Long id);

    RefundResponse approve(Long id);

    RefundResponse reject(Long id, RefundRejectRequest request);

    CountResponse getPendingCount();
}
