package kg.eco.operator.service;

import kg.eco.operator.dto.request.RecyclerCreateRequest;
import kg.eco.operator.dto.request.RecyclerToggleStatusRequest;
import kg.eco.operator.dto.response.*;

import java.util.List;

public interface RecyclerService {

    PaginatedResponse<RecyclerResponse> getAll(int page, int pageSize, String search,
                                                String region, String status, String wasteGroup);

    RecyclerResponse create(RecyclerCreateRequest request);

    RecyclerResponse getById(Long id);

    RecyclerResponse update(Long id, RecyclerCreateRequest request);

    RecyclerResponse toggleStatus(Long id, RecyclerToggleStatusRequest request);

    List<RecyclerResponse> getActive();

    List<RecyclerResponse> getByGroup(String wasteGroup);

    RecyclerStatsResponse getStats();

    CapacityByGroupResponse getCapacityByGroup(String wasteGroup);
}
