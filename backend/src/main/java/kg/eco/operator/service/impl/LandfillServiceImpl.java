package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.LandfillMapper;
import kg.eco.operator.dto.request.LandfillCreateRequest;
import kg.eco.operator.dto.response.LandfillResponse;
import kg.eco.operator.dto.response.LandfillStatsResponse;
import kg.eco.operator.entity.Landfill;
import kg.eco.operator.entity.enums.LandfillStatus;
import kg.eco.operator.entity.enums.LandfillType;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.LandfillRepository;
import kg.eco.operator.service.LandfillService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LandfillServiceImpl implements LandfillService {

    private final LandfillRepository landfillRepository;
    private final LandfillMapper landfillMapper;

    @Override
    public List<LandfillResponse> getAll(String region, String type, String status) {
        List<Landfill> landfills;

        LandfillStatus ls = parseLandfillStatus(status);
        LandfillType lt = parseLandfillType(type);

        if (region != null && ls != null && lt != null) {
            landfills = landfillRepository.findByRegionAndStatusAndType(region, ls, lt);
        } else if (region != null && ls != null) {
            landfills = landfillRepository.findByRegionAndStatus(region, ls);
        } else if (region != null && lt != null) {
            landfills = landfillRepository.findByRegionAndType(region, lt);
        } else if (ls != null && lt != null) {
            landfills = landfillRepository.findByStatusAndType(ls, lt);
        } else if (region != null) {
            landfills = landfillRepository.findByRegion(region);
        } else if (ls != null) {
            landfills = landfillRepository.findByStatus(ls);
        } else if (lt != null) {
            landfills = landfillRepository.findByType(lt);
        } else {
            landfills = landfillRepository.findAll();
        }

        return landfillMapper.toResponseList(landfills);
    }

    @Override
    @Transactional
    public LandfillResponse create(LandfillCreateRequest request) {
        Landfill landfill = new Landfill();
        mapRequestToEntity(request, landfill);
        landfill = landfillRepository.save(landfill);
        return landfillMapper.toResponse(landfill);
    }

    @Override
    public LandfillResponse getById(Long id) {
        return landfillMapper.toResponse(findLandfillById(id));
    }

    @Override
    @Transactional
    public LandfillResponse update(Long id, LandfillCreateRequest request) {
        Landfill landfill = findLandfillById(id);
        mapRequestToEntity(request, landfill);
        landfill = landfillRepository.save(landfill);
        return landfillMapper.toResponse(landfill);
    }

    @Override
    public List<LandfillResponse> getActive() {
        return landfillMapper.toResponseList(
                landfillRepository.findByStatus(LandfillStatus.ACTIVE));
    }

    @Override
    public List<LandfillResponse> getByRegion(String region) {
        return landfillMapper.toResponseList(landfillRepository.findByRegion(region));
    }

    @Override
    public List<LandfillResponse> getByType(String type) {
        LandfillType lt = parseLandfillType(type);
        if (lt == null) return List.of();
        return landfillMapper.toResponseList(landfillRepository.findByType(lt));
    }

    @Override
    public List<LandfillResponse> getByStatus(String status) {
        LandfillStatus ls = parseLandfillStatus(status);
        if (ls == null) return List.of();
        return landfillMapper.toResponseList(landfillRepository.findByStatus(ls));
    }

    @Override
    public LandfillStatsResponse getStats() {
        BigDecimal totalDesignCapacity = landfillRepository.sumDesignCapacity();
        BigDecimal totalCurrentVolume = landfillRepository.sumCurrentVolume();
        BigDecimal averageFillLevel = landfillRepository.avgFillPercent();
        long overfilledCount = landfillRepository.countOverfilled();

        return LandfillStatsResponse.builder()
                .totalDesignCapacity(totalDesignCapacity)
                .totalCurrentVolume(totalCurrentVolume)
                .averageFillLevel(averageFillLevel.setScale(2, RoundingMode.HALF_UP))
                .overfilledCount(overfilledCount)
                .build();
    }

    // ─── Helpers ───

    private Landfill findLandfillById(Long id) {
        return landfillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Полигон не найден: " + id));
    }

    private LandfillStatus parseLandfillStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return LandfillStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private LandfillType parseLandfillType(String type) {
        if (type == null || type.isBlank()) return null;
        try {
            return LandfillType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private void mapRequestToEntity(LandfillCreateRequest request, Landfill landfill) {
        landfill.setName(request.getName());

        LandfillType lt = parseLandfillType(request.getType());
        if (lt != null) landfill.setType(lt);
        if (landfill.getType() == null) landfill.setType(LandfillType.MUNICIPAL);

        landfill.setRegion(request.getRegion());
        landfill.setAddress(request.getAddress());
        landfill.setLatitude(request.getLatitude());
        landfill.setLongitude(request.getLongitude());
        landfill.setArea(request.getArea());
        landfill.setDesignCapacity(request.getDesignCapacity());
        landfill.setCurrentVolume(request.getCurrentVolume());
        landfill.setYearOpened(request.getYearOpened());
        landfill.setOperator(request.getOperator());

        LandfillStatus ls = parseLandfillStatus(request.getStatus());
        if (ls != null) landfill.setStatus(ls);
        if (landfill.getStatus() == null) landfill.setStatus(LandfillStatus.ACTIVE);

        // Calculate fill percent
        if (request.getFillPercent() != null) {
            landfill.setFillPercent(request.getFillPercent());
        } else if (request.getDesignCapacity() != null && request.getCurrentVolume() != null
                && request.getDesignCapacity().compareTo(BigDecimal.ZERO) > 0) {
            landfill.setFillPercent(request.getCurrentVolume()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(request.getDesignCapacity(), 2, RoundingMode.HALF_UP));
        }

        // Infrastructure
        if (request.getInfrastructure() != null) {
            var inf = request.getInfrastructure();
            landfill.setHasWeighStation(inf.getHasWeighStation());
            landfill.setHasFencing(inf.getHasFencing());
            landfill.setHasAccessRoad(inf.getHasAccessRoad());
            landfill.setHasWaterMonitoring(inf.getHasWaterMonitoring());
            landfill.setHasGasCollection(inf.getHasGasCollection());
            landfill.setHasLeachateSystem(inf.getHasLeachateSystem());
        }

        // Equipment
        if (request.getEquipment() != null) {
            var eq = request.getEquipment();
            landfill.setBulldozers(eq.getBulldozers());
            landfill.setCompactors(eq.getCompactors());
            landfill.setExcavators(eq.getExcavators());
            landfill.setTrucks(eq.getTrucks());
        }

        // Morphological composition
        if (request.getMorphology() != null) {
            var m = request.getMorphology();
            landfill.setMorphOrganic(m.getOrganic());
            landfill.setMorphPaper(m.getPaper());
            landfill.setMorphPlastic(m.getPlastic());
            landfill.setMorphGlass(m.getGlass());
            landfill.setMorphMetal(m.getMetal());
            landfill.setMorphTextile(m.getTextile());
            landfill.setMorphOther(m.getOther());
        }
    }
}
