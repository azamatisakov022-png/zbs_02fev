package kg.eco.operator.service;

import kg.eco.operator.dto.request.ContestApplicationReviewRequest;
import kg.eco.operator.dto.request.ContestApplicationStatusCheckRequest;
import kg.eco.operator.dto.response.ContestApplicationResponse;
import kg.eco.operator.dto.response.ContestApplicationStatusResponse;
import kg.eco.operator.dto.response.CountResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ContestApplicationService {

    /** Публичная подача заявки на конкретный конкурс. */
    ContestApplicationResponse submit(
            Long contestId,
            String lastName, String firstName, String middleName,
            String phone, String email,
            MultipartFile document);

    /** Публичная проверка статуса заявителем (по номеру + email). */
    ContestApplicationStatusResponse checkStatus(ContestApplicationStatusCheckRequest request);

    /** Список заявок для ЛК сотрудника. Фильтры опциональны. */
    List<ContestApplicationResponse> getAll(Long contestId, String status, String search);

    ContestApplicationResponse getById(Long id);

    ContestApplicationResponse review(Long id, String reviewerInn, ContestApplicationReviewRequest request);

    ContestService.DownloadResult downloadDocument(Long id);

    /** Кол-во новых заявок для бейджа меню. */
    CountResponse getPendingCount();
}
