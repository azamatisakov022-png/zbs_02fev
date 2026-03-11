package kg.eco.operator.service.impl;

import kg.eco.operator.dto.response.DetectedCompanyResponse;
import kg.eco.operator.entity.DetectedCompany;
import kg.eco.operator.entity.User;
import kg.eco.operator.repository.DetectedCompanyRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.DetectedCompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DetectedCompanyServiceImpl implements DetectedCompanyService {

    private final DetectedCompanyRepository detectedCompanyRepository;
    private final UserRepository userRepository;

    @Override
    public Page<DetectedCompanyResponse> getAll(String status, String source, String search, Pageable pageable) {
        return detectedCompanyRepository
                .findWithFilters(status, source, search, pageable)
                .map(this::toResponse);
    }

    @Override
    public DetectedCompanyResponse getById(Long id) {
        DetectedCompany company = detectedCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Компания не найдена: " + id));
        return toResponse(company);
    }

    @Override
    @Transactional
    public DetectedCompanyResponse notify(Long id) {
        DetectedCompany company = detectedCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Компания не найдена: " + id));
        company.setStatus("notified");
        company.setNotifiedAt(LocalDateTime.now());
        log.info("Отправлено уведомление компании ИНН: {}", company.getInn());
        return toResponse(detectedCompanyRepository.save(company));
    }

    @Override
    @Transactional
    public DetectedCompanyResponse reject(Long id, String reason) {
        DetectedCompany company = detectedCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Компания не найдена: " + id));
        company.setStatus("rejected");
        company.setNotes(reason);
        log.info("Компания ИНН: {} отклонена. Причина: {}", company.getInn(), reason);
        return toResponse(detectedCompanyRepository.save(company));
    }

    @Override
    @Transactional
    public DetectedCompanyResponse assignEmployee(Long id, Long employeeId) {
        DetectedCompany company = detectedCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Компания не найдена: " + id));
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден: " + employeeId));
        company.setAssignedEmployee(employee);
        company.setStatus("in_progress");
        return toResponse(detectedCompanyRepository.save(company));
    }

    @Override
    public Object getStats() {
        return Map.of(
                "total", detectedCompanyRepository.count(),
                "new", detectedCompanyRepository.countByStatus("new"),
                "notified", detectedCompanyRepository.countByStatus("notified"),
                "inProgress", detectedCompanyRepository.countByStatus("in_progress"),
                "registered", detectedCompanyRepository.countByStatus("registered"),
                "rejected", detectedCompanyRepository.countByStatus("rejected")
        );
    }

    private DetectedCompanyResponse toResponse(DetectedCompany c) {
        return DetectedCompanyResponse.builder()
                .id(c.getId())
                .inn(c.getInn())
                .companyName(c.getCompanyName())
                .legalForm(c.getLegalForm())
                .legalAddress(c.getLegalAddress())
                .director(c.getDirector())
                .phone(c.getPhone())
                .email(c.getEmail())
                .okpoCode(c.getOkpoCode())
                .okedCodes(c.getOkedCodes())
                .source(c.getSource())
                .status(c.getStatus())
                .tnvedCodes(c.getTnvedCodes())
                .estimatedMass(c.getEstimatedMass())
                .gnsStatus(c.getGnsStatus())
                .assignedEmployeeName(c.getAssignedEmployee() != null
                        ? c.getAssignedEmployee().getCompanyName() : null)
                .notifiedAt(c.getNotifiedAt())
                .notes(c.getNotes())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
