package kg.eco.operator.service;

import kg.eco.operator.dto.request.LandfillCreateRequest;
import kg.eco.operator.dto.response.LandfillResponse;
import kg.eco.operator.dto.response.LandfillStatsResponse;

import java.util.List;

public interface LandfillService {

    List<LandfillResponse> getAll(String region, String type, String status);

    LandfillResponse create(LandfillCreateRequest request);

    LandfillResponse getById(Long id);

    LandfillResponse update(Long id, LandfillCreateRequest request);

    List<LandfillResponse> getActive();

    List<LandfillResponse> getByRegion(String region);

    List<LandfillResponse> getByType(String type);

    List<LandfillResponse> getByStatus(String status);

    LandfillStatsResponse getStats();
}
