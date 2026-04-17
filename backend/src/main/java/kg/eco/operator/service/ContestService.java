package kg.eco.operator.service;

import kg.eco.operator.dto.request.ContestCreateRequest;
import kg.eco.operator.dto.request.ContestUpdateRequest;
import kg.eco.operator.dto.response.ContestResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ContestService {

    /** Список конкурсов для ЛК сотрудника (фильтр по статусу). */
    List<ContestResponse> getAll(String status);

    /** Список ОПУБЛИКОВАННЫХ конкурсов с открытым приёмом заявок (для публики). */
    List<ContestResponse> getPublic();

    ContestResponse getById(Long id);

    /** Публичный просмотр (без internal-полей). */
    ContestResponse getPublicById(Long id);

    ContestResponse create(String userInn, ContestCreateRequest request);

    ContestResponse update(Long id, ContestUpdateRequest request);

    ContestResponse publish(Long id);

    ContestResponse close(Long id);

    void delete(Long id);

    ContestResponse uploadRegulations(Long id, MultipartFile file);

    /** Скачать положение конкурса (PDF). */
    DownloadResult downloadRegulations(Long id);

    record DownloadResult(java.io.InputStream stream, String fileName, String contentType) {}
}
