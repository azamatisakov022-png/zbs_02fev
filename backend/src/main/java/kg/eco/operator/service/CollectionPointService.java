package kg.eco.operator.service;

import kg.eco.operator.dto.request.CollectionPointCreateRequest;
import kg.eco.operator.dto.response.CollectionPointResponse;

import java.util.List;

public interface CollectionPointService {

    List<CollectionPointResponse> getAll(String region, String status);

    CollectionPointResponse create(CollectionPointCreateRequest request);

    CollectionPointResponse getById(Long id);

    CollectionPointResponse update(Long id, CollectionPointCreateRequest request);

    void delete(Long id);

    List<CollectionPointResponse> getByRegion(String region);

    List<CollectionPointResponse> getActive();
}
