package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.ContestApplicationMapper;
import kg.eco.operator.dto.request.ContestApplicationReviewRequest;
import kg.eco.operator.dto.request.ContestApplicationStatusCheckRequest;
import kg.eco.operator.dto.response.ContestApplicationResponse;
import kg.eco.operator.dto.response.ContestApplicationStatusResponse;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.entity.Contest;
import kg.eco.operator.entity.ContestApplication;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.ContestApplicationStatus;
import kg.eco.operator.entity.enums.ContestStatus;
import kg.eco.operator.event.ContestApplicationStatusEvent;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.ContestApplicationRepository;
import kg.eco.operator.repository.ContestRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.ContestApplicationService;
import kg.eco.operator.service.ContestService;
import kg.eco.operator.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContestApplicationServiceImpl implements ContestApplicationService {

    private static final String MINIO_FOLDER = "contests/applications";
    private static final long MAX_DOC_SIZE = 10L * 1024 * 1024; // 10 МБ по ТЗ

    private final ContestApplicationRepository applicationRepository;
    private final ContestRepository contestRepository;
    private final UserRepository userRepository;
    private final ContestApplicationMapper applicationMapper;
    private final FileStorageService fileStorageService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public ContestApplicationResponse submit(
            Long contestId,
            String lastName, String firstName, String middleName,
            String phone, String email,
            MultipartFile document) {

        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Конкурс не найден: " + contestId));

        if (contest.getStatus() != ContestStatus.PUBLISHED) {
            throw new BusinessLogicException("Приём заявок на этот конкурс закрыт");
        }
        if (contest.getDeadline().isBefore(LocalDateTime.now())) {
            throw new BusinessLogicException("Срок подачи заявок истёк");
        }

        validateDocument(document);

        String objectKey = fileStorageService.upload(document, MINIO_FOLDER);

        ContestApplication app = new ContestApplication();
        app.setNumber(generateNumber());
        app.setContest(contest);
        app.setLastName(safe(lastName));
        app.setFirstName(safe(firstName));
        app.setMiddleName(middleName != null ? middleName.trim() : null);
        app.setPhone(safe(phone));
        app.setEmail(safe(email).toLowerCase());
        app.setDocumentObjectKey(objectKey);
        app.setDocumentFileName(document.getOriginalFilename());
        app.setDocumentSize(document.getSize());
        app.setStatus(ContestApplicationStatus.NEW);

        app = applicationRepository.save(app);

        // Уведомление сотрудникам Эко Оператора (in-app)
        eventPublisher.publishEvent(new ContestApplicationStatusEvent(
                app.getId(), app.getNumber(),
                contest.getId(), contest.getTitle(),
                null, "new", null));

        return applicationMapper.toResponse(app);
    }

    @Override
    public ContestApplicationStatusResponse checkStatus(ContestApplicationStatusCheckRequest request) {
        ContestApplication app = applicationRepository
                .findByNumberAndEmailIgnoreCase(request.getNumber().trim(), request.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Заявка не найдена. Проверьте номер и email."));
        return applicationMapper.toStatusResponse(app);
    }

    @Override
    public List<ContestApplicationResponse> getAll(Long contestId, String status, String search) {
        List<ContestApplication> apps;
        if (contestId != null) {
            apps = applicationRepository.findByContest_IdOrderByCreatedAtDesc(contestId);
        } else if (status != null && !status.isBlank()) {
            try {
                ContestApplicationStatus s = ContestApplicationStatus.valueOf(status.toUpperCase());
                apps = applicationRepository.findByStatusOrderByCreatedAtDesc(s);
            } catch (IllegalArgumentException e) {
                apps = applicationRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            apps = applicationRepository.findAllByOrderByCreatedAtDesc();
        }

        if (status != null && !status.isBlank() && contestId != null) {
            try {
                ContestApplicationStatus s = ContestApplicationStatus.valueOf(status.toUpperCase());
                apps = apps.stream().filter(a -> a.getStatus() == s).toList();
            } catch (IllegalArgumentException ignored) {}
        }

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            apps = apps.stream().filter(a ->
                    a.getNumber().toLowerCase().contains(q)
                            || (a.getLastName() != null && a.getLastName().toLowerCase().contains(q))
                            || (a.getFirstName() != null && a.getFirstName().toLowerCase().contains(q))
                            || (a.getEmail() != null && a.getEmail().toLowerCase().contains(q))
            ).toList();
        }

        return applicationMapper.toResponseList(apps);
    }

    @Override
    public ContestApplicationResponse getById(Long id) {
        return applicationMapper.toResponse(findApp(id));
    }

    @Override
    @Transactional
    public ContestApplicationResponse review(Long id, String reviewerInn,
                                              ContestApplicationReviewRequest request) {
        ContestApplication app = findApp(id);

        ContestApplicationStatus newStatus;
        try {
            newStatus = ContestApplicationStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessLogicException("Недопустимый статус: " + request.getStatus());
        }

        if (newStatus == ContestApplicationStatus.NEW) {
            throw new BusinessLogicException("Нельзя вернуть заявку в статус 'новая'");
        }
        if (app.getStatus() == ContestApplicationStatus.APPROVED
                || app.getStatus() == ContestApplicationStatus.REJECTED) {
            throw new BusinessLogicException("Заявка уже рассмотрена");
        }
        if (newStatus == ContestApplicationStatus.REJECTED
                && (request.getComment() == null || request.getComment().isBlank())) {
            throw new BusinessLogicException("При отклонении укажите причину в комментарии");
        }

        String oldStatusValue = app.getStatus().getValue();

        app.setStatus(newStatus);
        if (request.getComment() != null && !request.getComment().isBlank()) {
            app.setComment(request.getComment().trim());
        }

        if (newStatus == ContestApplicationStatus.APPROVED
                || newStatus == ContestApplicationStatus.REJECTED) {
            User reviewer = userRepository.findByInn(reviewerInn).orElse(null);
            app.setReviewedBy(reviewer);
            app.setReviewedAt(LocalDateTime.now());
        }

        app = applicationRepository.save(app);

        eventPublisher.publishEvent(new ContestApplicationStatusEvent(
                app.getId(), app.getNumber(),
                app.getContest().getId(), app.getContest().getTitle(),
                oldStatusValue, newStatus.getValue(), app.getComment()));

        return applicationMapper.toResponse(app);
    }

    @Override
    public ContestService.DownloadResult downloadDocument(Long id) {
        ContestApplication app = findApp(id);
        return new ContestService.DownloadResult(
                fileStorageService.download(app.getDocumentObjectKey()),
                app.getDocumentFileName(),
                "application/octet-stream");
    }

    @Override
    public CountResponse getPendingCount() {
        long count = applicationRepository.countByStatus(ContestApplicationStatus.NEW);
        return new CountResponse(count);
    }

    // ─── Helpers ───

    private ContestApplication findApp(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Заявка не найдена: " + id));
    }

    private void validateDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessLogicException("Документ не прикреплён");
        }
        if (file.getSize() > MAX_DOC_SIZE) {
            throw new BusinessLogicException("Размер документа превышает 10 МБ");
        }
        String name = file.getOriginalFilename();
        if (name == null) {
            throw new BusinessLogicException("Не удалось определить имя файла");
        }
        String lower = name.toLowerCase();
        boolean ok = lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx");
        if (!ok) {
            throw new BusinessLogicException("Допустимые форматы: PDF, DOC, DOCX");
        }
    }

    private String generateNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long maxNum = applicationRepository.findMaxNumberForYear(year);
        return String.format("КНК-%s-%06d", year, maxNum + 1);
    }

    private String safe(String s) {
        return s == null ? "" : s.trim();
    }
}
