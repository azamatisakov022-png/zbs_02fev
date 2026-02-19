package kg.eco.operator.service;

import kg.eco.operator.dto.request.DumpCreateRequest;
import kg.eco.operator.dto.response.DumpResponse;

import java.util.List;

public interface DumpService {

    List<DumpResponse> getAll(String region, String status);

    DumpResponse create(DumpCreateRequest request);

    DumpResponse getById(Long id);

    DumpResponse update(Long id, DumpCreateRequest request);

    void delete(Long id);

    List<DumpResponse> getByRegion(String region);

    List<DumpResponse> getByStatus(String status);
}
