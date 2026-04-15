package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.DumpMapper;
import kg.eco.operator.dto.request.DumpCreateRequest;
import kg.eco.operator.dto.response.DumpResponse;
import kg.eco.operator.entity.Dump;
import kg.eco.operator.entity.enums.DumpStatus;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.DumpRepository;
import kg.eco.operator.service.AuditLogger;
import kg.eco.operator.service.DumpService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DumpServiceImpl implements DumpService {

    private final DumpRepository dumpRepository;
    private final DumpMapper dumpMapper;
    private final AuditLogger audit;

    @Override
    public List<DumpResponse> getAll(String region, String status) {
        List<Dump> dumps;

        DumpStatus dumpStatus = parseStatus(status);

        if (region != null && dumpStatus != null) {
            dumps = dumpRepository.findByRegionAndStatus(region, dumpStatus);
        } else if (region != null) {
            dumps = dumpRepository.findByRegion(region);
        } else if (dumpStatus != null) {
            dumps = dumpRepository.findByStatus(dumpStatus);
        } else {
            dumps = dumpRepository.findAll();
        }

        return dumpMapper.toResponseList(dumps);
    }

    @Override
    @Transactional
    public DumpResponse create(DumpCreateRequest request) {
        Dump dump = new Dump();
        mapRequestToEntity(request, dump);
        dump = dumpRepository.save(dump);
        audit.log("CREATE", "DUMP", dump.getId(),
                "Зарегистрирована несанкц. свалка: " + dump.getName());
        return dumpMapper.toResponse(dump);
    }

    @Override
    public DumpResponse getById(Long id) {
        return dumpMapper.toResponse(findDumpById(id));
    }

    @Override
    @Transactional
    public DumpResponse update(Long id, DumpCreateRequest request) {
        Dump dump = findDumpById(id);
        String oldStatus = dump.getStatus() != null ? dump.getStatus().name() : "—";
        mapRequestToEntity(request, dump);
        dump = dumpRepository.save(dump);
        String newStatus = dump.getStatus() != null ? dump.getStatus().name() : "—";
        String details = "Обновлена свалка: " + dump.getName();
        if (!oldStatus.equals(newStatus)) {
            details += " (статус " + oldStatus + " → " + newStatus + ")";
        }
        audit.log("UPDATE", "DUMP", dump.getId(), details);
        return dumpMapper.toResponse(dump);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Dump dump = dumpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Свалка не найдена: " + id));
        String name = dump.getName();
        dumpRepository.deleteById(id);
        audit.log("DELETE", "DUMP", id, "Удалена свалка: " + name);
    }

    @Override
    public List<DumpResponse> getByRegion(String region) {
        return dumpMapper.toResponseList(dumpRepository.findByRegion(region));
    }

    @Override
    public List<DumpResponse> getByStatus(String status) {
        DumpStatus ds = parseStatus(status);
        if (ds == null) return List.of();
        return dumpMapper.toResponseList(dumpRepository.findByStatus(ds));
    }

    // ─── Helpers ───

    private Dump findDumpById(Long id) {
        return dumpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Свалка не найдена: " + id));
    }

    private DumpStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return DumpStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private void mapRequestToEntity(DumpCreateRequest request, Dump dump) {
        dump.setName(request.getName());
        dump.setRegion(request.getRegion());
        dump.setAddress(request.getAddress());
        dump.setLatitude(request.getLatitude());
        dump.setLongitude(request.getLongitude());
        dump.setArea(request.getArea());
        dump.setEstimatedVolume(request.getEstimatedVolume());
        if (request.getWasteTypes() != null) {
            dump.setWasteTypes(request.getWasteTypes().toArray(new String[0]));
        }
        if (request.getStatus() != null) {
            DumpStatus ds = parseStatus(request.getStatus());
            if (ds != null) dump.setStatus(ds);
        }
        if (dump.getStatus() == null) dump.setStatus(DumpStatus.ACTIVE);
        dump.setDiscoveredDate(request.getDiscoveredDate());
        if (request.getPhotos() != null) {
            dump.setPhotos(request.getPhotos().toArray(new String[0]));
        }
        dump.setNotes(request.getNotes());
    }
}
