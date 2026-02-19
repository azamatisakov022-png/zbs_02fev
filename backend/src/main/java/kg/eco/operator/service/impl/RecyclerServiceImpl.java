package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.RecyclerMapper;
import kg.eco.operator.dto.request.RecyclerCreateRequest;
import kg.eco.operator.dto.request.RecyclerToggleStatusRequest;
import kg.eco.operator.dto.response.*;
import kg.eco.operator.entity.Recycler;
import kg.eco.operator.entity.RecyclerCapacity;
import kg.eco.operator.entity.enums.InspectionStatus;
import kg.eco.operator.entity.enums.RecyclerStatus;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.RecyclerCapacityRepository;
import kg.eco.operator.repository.RecyclerRepository;
import kg.eco.operator.service.RecyclerService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecyclerServiceImpl implements RecyclerService {

    private final RecyclerRepository recyclerRepository;
    private final RecyclerCapacityRepository capacityRepository;
    private final RecyclerMapper recyclerMapper;

    @Override
    public PaginatedResponse<RecyclerResponse> getAll(int page, int pageSize, String search,
                                                        String region, String status, String wasteGroup) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("id").descending());

        Specification<Recycler> spec = buildSpecification(search, region, status, wasteGroup);
        Page<Recycler> recyclerPage = recyclerRepository.findAll(spec, pageRequest);

        List<RecyclerResponse> responses = recyclerMapper.toResponseList(recyclerPage.getContent());
        return PaginatedResponse.of(recyclerPage, responses);
    }

    @Override
    @Transactional
    public RecyclerResponse create(RecyclerCreateRequest request) {
        // Check for duplicate INN
        recyclerRepository.findByInn(request.getInn()).ifPresent(r -> {
            throw new BusinessLogicException("Переработчик с ИНН " + request.getInn() + " уже существует");
        });

        Recycler recycler = new Recycler();
        mapRequestToEntity(request, recycler);
        recycler = recyclerRepository.save(recycler);

        // Save capacities
        if (request.getCapacities() != null) {
            saveCapacities(recycler, request.getCapacities());
        }

        return recyclerMapper.toResponse(recycler);
    }

    @Override
    public RecyclerResponse getById(Long id) {
        Recycler recycler = findRecyclerById(id);
        return recyclerMapper.toResponse(recycler);
    }

    @Override
    @Transactional
    public RecyclerResponse update(Long id, RecyclerCreateRequest request) {
        Recycler recycler = findRecyclerById(id);
        mapRequestToEntity(request, recycler);
        recycler = recyclerRepository.save(recycler);

        // Update capacities
        if (request.getCapacities() != null) {
            recycler.getCapacities().clear();
            recyclerRepository.flush();
            saveCapacities(recycler, request.getCapacities());
        }

        return recyclerMapper.toResponse(recycler);
    }

    @Override
    @Transactional
    public RecyclerResponse toggleStatus(Long id, RecyclerToggleStatusRequest request) {
        Recycler recycler = findRecyclerById(id);

        if (request.getStatus() != null) {
            try {
                RecyclerStatus newStatus = RecyclerStatus.valueOf(request.getStatus().toUpperCase());
                recycler.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new BusinessLogicException("Некорректный статус: " + request.getStatus());
            }
        } else {
            // Toggle between ACTIVE and SUSPENDED
            if (recycler.getStatus() == RecyclerStatus.ACTIVE) {
                recycler.setStatus(RecyclerStatus.SUSPENDED);
            } else {
                recycler.setStatus(RecyclerStatus.ACTIVE);
            }
        }

        if (request.getReason() != null) {
            recycler.setSuspensionReason(request.getReason());
        }

        recycler = recyclerRepository.save(recycler);
        return recyclerMapper.toResponse(recycler);
    }

    @Override
    public List<RecyclerResponse> getActive() {
        List<Recycler> active = recyclerRepository.findByStatus(RecyclerStatus.ACTIVE);
        return recyclerMapper.toResponseList(active);
    }

    @Override
    public List<RecyclerResponse> getByGroup(String wasteGroup) {
        List<RecyclerCapacity> capacities = capacityRepository.findByWasteGroupAndRecyclerActive(wasteGroup);
        List<Recycler> recyclers = capacities.stream()
                .map(RecyclerCapacity::getRecycler)
                .distinct()
                .toList();
        return recyclerMapper.toResponseList(recyclers);
    }

    @Override
    public RecyclerStatsResponse getStats() {
        long total = recyclerRepository.count();
        long active = recyclerRepository.countActive();
        long suspended = recyclerRepository.countSuspended();
        BigDecimal totalCapacity = capacityRepository.sumTotalCapacity();
        BigDecimal totalLoad = capacityRepository.sumTotalLoad();

        BigDecimal loadPercent = BigDecimal.ZERO;
        if (totalCapacity.compareTo(BigDecimal.ZERO) > 0) {
            loadPercent = totalLoad.multiply(BigDecimal.valueOf(100))
                    .divide(totalCapacity, 2, RoundingMode.HALF_UP);
        }

        return RecyclerStatsResponse.builder()
                .total(total)
                .active(active)
                .suspended(suspended)
                .totalCapacity(totalCapacity)
                .totalLoad(totalLoad)
                .loadPercent(loadPercent)
                .build();
    }

    @Override
    public CapacityByGroupResponse getCapacityByGroup(String wasteGroup) {
        BigDecimal totalCapacity = capacityRepository.sumCapacityByGroup(wasteGroup);
        BigDecimal currentLoad = capacityRepository.sumLoadByGroup(wasteGroup);
        BigDecimal freeCapacity = totalCapacity.subtract(currentLoad);

        BigDecimal loadPercent = BigDecimal.ZERO;
        if (totalCapacity.compareTo(BigDecimal.ZERO) > 0) {
            loadPercent = currentLoad.multiply(BigDecimal.valueOf(100))
                    .divide(totalCapacity, 2, RoundingMode.HALF_UP);
        }

        return CapacityByGroupResponse.builder()
                .totalCapacity(totalCapacity)
                .currentLoad(currentLoad)
                .freeCapacity(freeCapacity)
                .loadPercent(loadPercent)
                .build();
    }

    // ─── Helpers ───

    private Recycler findRecyclerById(Long id) {
        return recyclerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Переработчик не найден: " + id));
    }

    private void mapRequestToEntity(RecyclerCreateRequest request, Recycler recycler) {
        recycler.setCompanyName(request.getCompanyName());
        recycler.setLegalForm(request.getLegalForm());
        recycler.setInn(request.getInn());
        recycler.setRegion(request.getRegion());
        recycler.setAddress(request.getAddress());
        recycler.setLatitude(request.getLatitude());
        recycler.setLongitude(request.getLongitude());
        recycler.setDirector(request.getDirector());
        recycler.setDirectorPosition(request.getDirectorPosition());
        recycler.setContactPerson(request.getContactPerson());
        recycler.setContactPosition(request.getContactPosition());
        recycler.setPhone(request.getPhone());
        recycler.setEmail(request.getEmail());
        recycler.setLicenseNumber(request.getLicenseNumber());
        recycler.setLicenseDate(request.getLicenseDate());
        recycler.setLicenseExpiry(request.getLicenseExpiry());
        recycler.setLicenseIssuer(request.getLicenseIssuer());
        recycler.setEcoPassportNumber(request.getEcoPassportNumber());
        recycler.setEcoPassportDate(request.getEcoPassportDate());

        if (request.getTechnologies() != null) {
            recycler.setTechnologies(request.getTechnologies().toArray(new String[0]));
        }
        recycler.setEquipment(request.getEquipment());
        recycler.setTerritoryArea(request.getTerritoryArea());
        recycler.setEmployeesCount(request.getEmployeesCount());
        if (request.getCertifications() != null) {
            recycler.setCertifications(request.getCertifications().toArray(new String[0]));
        }

        if (request.getInspectionStatus() != null) {
            try {
                recycler.setInspectionStatus(
                        InspectionStatus.valueOf(request.getInspectionStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }
        recycler.setLastInspectionDate(request.getLastInspectionDate());
        recycler.setInspectionRemarks(request.getInspectionRemarks());
        recycler.setNextInspectionDate(request.getNextInspectionDate());
        recycler.setVolumeCurrentYear(request.getVolumeCurrentYear());
        recycler.setVolumePreviousYear(request.getVolumePreviousYear());

        if (request.getStatus() != null) {
            try {
                recycler.setStatus(RecyclerStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }
        recycler.setNotes(request.getNotes());
    }

    private void saveCapacities(Recycler recycler, List<RecyclerCreateRequest.CapacityRequest> capacityRequests) {
        for (RecyclerCreateRequest.CapacityRequest cr : capacityRequests) {
            RecyclerCapacity capacity = new RecyclerCapacity();
            capacity.setRecycler(recycler);
            capacity.setWasteGroup(cr.getWasteGroup());
            capacity.setWasteCode(cr.getWasteCode());
            capacity.setMonthlyCapacity(cr.getMonthlyCapacity());
            capacity.setAnnualCapacity(cr.getAnnualCapacity() != null ? cr.getAnnualCapacity()
                    : cr.getMonthlyCapacity().multiply(BigDecimal.valueOf(12)));
            capacity.setCurrentLoad(cr.getCurrentLoad() != null ? cr.getCurrentLoad() : BigDecimal.ZERO);

            // Calculate load percent
            if (cr.getMonthlyCapacity().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal load = capacity.getCurrentLoad().multiply(BigDecimal.valueOf(100))
                        .divide(cr.getMonthlyCapacity(), 2, RoundingMode.HALF_UP);
                capacity.setLoadPercent(load);
            } else {
                capacity.setLoadPercent(BigDecimal.ZERO);
            }

            capacity.setTechnology(cr.getTechnology());
            capacityRepository.save(capacity);
            recycler.getCapacities().add(capacity);
        }
    }

    private Specification<Recycler> buildSpecification(String search, String region,
                                                         String status, String wasteGroup) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("companyName")), pattern),
                        cb.like(root.get("inn"), "%" + search.trim() + "%")
                ));
            }

            if (region != null && !region.isBlank()) {
                predicates.add(cb.equal(root.get("region"), region));
            }

            if (status != null && !status.isBlank()) {
                try {
                    RecyclerStatus rs = RecyclerStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), rs));
                } catch (IllegalArgumentException ignored) {
                }
            }

            if (wasteGroup != null && !wasteGroup.isBlank()) {
                Join<Object, Object> capacitiesJoin = root.join("capacities", JoinType.INNER);
                predicates.add(cb.equal(capacitiesJoin.get("wasteGroup"), wasteGroup));
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
