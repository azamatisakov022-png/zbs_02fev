package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.CollectionPointMapper;
import kg.eco.operator.dto.request.CollectionPointCreateRequest;
import kg.eco.operator.dto.response.CollectionPointResponse;
import kg.eco.operator.entity.CollectionPoint;
import kg.eco.operator.entity.enums.CollectionPointStatus;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.CollectionPointRepository;
import kg.eco.operator.service.CollectionPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionPointServiceImpl implements CollectionPointService {

    private final CollectionPointRepository repository;
    private final CollectionPointMapper mapper;

    @Override
    public List<CollectionPointResponse> getAll(String region, String status) {
        List<CollectionPoint> points;

        CollectionPointStatus cpStatus = parseStatus(status);

        if (region != null && cpStatus != null) {
            points = repository.findByRegionAndStatus(region, cpStatus);
        } else if (region != null) {
            points = repository.findByRegion(region);
        } else if (cpStatus != null) {
            points = repository.findByStatus(cpStatus);
        } else {
            points = repository.findAll();
        }

        return mapper.toResponseList(points);
    }

    @Override
    @Transactional
    public CollectionPointResponse create(CollectionPointCreateRequest request) {
        CollectionPoint point = new CollectionPoint();
        mapRequestToEntity(request, point);
        point = repository.save(point);
        return mapper.toResponse(point);
    }

    @Override
    public CollectionPointResponse getById(Long id) {
        return mapper.toResponse(findById(id));
    }

    @Override
    @Transactional
    public CollectionPointResponse update(Long id, CollectionPointCreateRequest request) {
        CollectionPoint point = findById(id);
        mapRequestToEntity(request, point);
        point = repository.save(point);
        return mapper.toResponse(point);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Пункт приёма не найден: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<CollectionPointResponse> getByRegion(String region) {
        return mapper.toResponseList(repository.findByRegion(region));
    }

    @Override
    public List<CollectionPointResponse> getActive() {
        return mapper.toResponseList(repository.findByStatus(CollectionPointStatus.ACTIVE));
    }

    // ─── Helpers ───

    private CollectionPoint findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Пункт приёма не найден: " + id));
    }

    private CollectionPointStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return CollectionPointStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private void mapRequestToEntity(CollectionPointCreateRequest request, CollectionPoint point) {
        point.setName(request.getName());
        point.setRegion(request.getRegion());
        point.setAddress(request.getAddress());
        point.setLatitude(request.getLatitude());
        point.setLongitude(request.getLongitude());
        if (request.getWasteTypes() != null) {
            point.setWasteTypes(request.getWasteTypes().toArray(new String[0]));
        }
        point.setOperatingHours(request.getOperatingHours());
        point.setContactPhone(request.getContactPhone());
        point.setOperator(request.getOperator());
        if (request.getStatus() != null) {
            CollectionPointStatus cps = parseStatus(request.getStatus());
            if (cps != null) point.setStatus(cps);
        }
        if (point.getStatus() == null) point.setStatus(CollectionPointStatus.ACTIVE);
    }
}
