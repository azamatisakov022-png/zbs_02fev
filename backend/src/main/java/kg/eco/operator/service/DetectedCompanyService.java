package kg.eco.operator.service;

import kg.eco.operator.dto.response.DetectedCompanyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DetectedCompanyService {
    Page<DetectedCompanyResponse> getAll(String status, String source, String search, Pageable pageable);
    DetectedCompanyResponse getById(Long id);
    DetectedCompanyResponse notify(Long id);
    DetectedCompanyResponse reject(Long id, String reason);
    DetectedCompanyResponse assignEmployee(Long id, Long employeeId);
    Object getStats();
}
