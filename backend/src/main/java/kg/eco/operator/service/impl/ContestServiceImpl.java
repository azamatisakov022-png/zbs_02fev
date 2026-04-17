package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.ContestMapper;
import kg.eco.operator.dto.request.ContestCreateRequest;
import kg.eco.operator.dto.request.ContestUpdateRequest;
import kg.eco.operator.dto.response.ContestResponse;
import kg.eco.operator.entity.Contest;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.ContestStatus;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.ContestApplicationRepository;
import kg.eco.operator.repository.ContestRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.ContestService;
import kg.eco.operator.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContestServiceImpl implements ContestService {

    private static final String MINIO_FOLDER = "contests/regulations";

    private final ContestRepository contestRepository;
    private final ContestApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ContestMapper contestMapper;
    private final FileStorageService fileStorageService;

    @Override
    public List<ContestResponse> getAll(String status) {
        List<Contest> contests;
        if (status != null && !status.isBlank()) {
            try {
                ContestStatus cs = ContestStatus.valueOf(status.toUpperCase());
                contests = contestRepository.findByStatus(cs);
            } catch (IllegalArgumentException e) {
                contests = contestRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            contests = contestRepository.findAllByOrderByCreatedAtDesc();
        }
        return contests.stream().map(this::enrichWithCount).toList();
    }

    @Override
    public List<ContestResponse> getPublic() {
        List<Contest> contests = contestRepository.findByStatusAndDeadlineAfterOrderByDeadlineAsc(
                ContestStatus.PUBLISHED, LocalDateTime.now());
        return contestMapper.toResponseList(contests);
    }

    @Override
    public ContestResponse getById(Long id) {
        return enrichWithCount(findContest(id));
    }

    @Override
    public ContestResponse getPublicById(Long id) {
        Contest contest = findContest(id);
        if (contest.getStatus() == ContestStatus.DRAFT) {
            throw new ResourceNotFoundException("Конкурс не найден: " + id);
        }
        return contestMapper.toResponse(contest);
    }

    @Override
    @Transactional
    public ContestResponse create(String userInn, ContestCreateRequest request) {
        User user = userRepository.findByInn(userInn)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        if (request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new BusinessLogicException("Срок подачи не может быть в прошлом");
        }

        Contest contest = new Contest();
        contest.setTitle(request.getTitle().trim());
        contest.setDescription(request.getDescription().trim());
        contest.setConditions(request.getConditions());
        contest.setGrantAmount(request.getGrantAmount());
        contest.setGrantCurrency(request.getGrantCurrency() != null
                ? request.getGrantCurrency() : "KGS");
        contest.setDeadline(request.getDeadline());
        contest.setStatus(ContestStatus.DRAFT);
        contest.setCreatedBy(user);

        contest = contestRepository.save(contest);
        return contestMapper.toResponse(contest);
    }

    @Override
    @Transactional
    public ContestResponse update(Long id, ContestUpdateRequest request) {
        Contest contest = findContest(id);
        if (contest.getStatus() == ContestStatus.CLOSED) {
            throw new BusinessLogicException("Закрытый конкурс редактировать нельзя");
        }
        if (request.getTitle() != null) contest.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) contest.setDescription(request.getDescription().trim());
        if (request.getConditions() != null) contest.setConditions(request.getConditions());
        if (request.getGrantAmount() != null) contest.setGrantAmount(request.getGrantAmount());
        if (request.getGrantCurrency() != null) contest.setGrantCurrency(request.getGrantCurrency());
        if (request.getDeadline() != null) {
            if (request.getDeadline().isBefore(LocalDateTime.now())
                    && contest.getStatus() == ContestStatus.PUBLISHED) {
                throw new BusinessLogicException("Срок подачи не может быть в прошлом");
            }
            contest.setDeadline(request.getDeadline());
        }
        contest = contestRepository.save(contest);
        return enrichWithCount(contest);
    }

    @Override
    @Transactional
    public ContestResponse publish(Long id) {
        Contest contest = findContest(id);
        if (contest.getStatus() != ContestStatus.DRAFT) {
            throw new BusinessLogicException("Опубликовать можно только черновик");
        }
        if (contest.getDeadline().isBefore(LocalDateTime.now())) {
            throw new BusinessLogicException("Срок подачи уже истёк — измените дату перед публикацией");
        }
        contest.setStatus(ContestStatus.PUBLISHED);
        contest = contestRepository.save(contest);
        return enrichWithCount(contest);
    }

    @Override
    @Transactional
    public ContestResponse close(Long id) {
        Contest contest = findContest(id);
        if (contest.getStatus() != ContestStatus.PUBLISHED) {
            throw new BusinessLogicException("Закрыть можно только опубликованный конкурс");
        }
        contest.setStatus(ContestStatus.CLOSED);
        contest = contestRepository.save(contest);
        return enrichWithCount(contest);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Contest contest = findContest(id);
        if (contest.getStatus() != ContestStatus.DRAFT) {
            throw new BusinessLogicException("Удалить можно только черновик");
        }
        long apps = applicationRepository.countByContest_Id(id);
        if (apps > 0) {
            throw new BusinessLogicException("Нельзя удалить конкурс с заявками");
        }
        if (contest.getRegulationsObjectKey() != null) {
            try {
                fileStorageService.delete(contest.getRegulationsObjectKey());
            } catch (Exception e) {
                log.warn("Не удалось удалить файл положения {}: {}",
                        contest.getRegulationsObjectKey(), e.getMessage());
            }
        }
        contestRepository.delete(contest);
    }

    @Override
    @Transactional
    public ContestResponse uploadRegulations(Long id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessLogicException("Файл не передан");
        }
        Contest contest = findContest(id);
        // Удаляем старый файл, если есть
        if (contest.getRegulationsObjectKey() != null) {
            try {
                fileStorageService.delete(contest.getRegulationsObjectKey());
            } catch (Exception e) {
                log.warn("Не удалось удалить старое положение: {}", e.getMessage());
            }
        }
        String objectKey = fileStorageService.upload(file, MINIO_FOLDER);
        contest.setRegulationsObjectKey(objectKey);
        contest.setRegulationsFileName(file.getOriginalFilename());
        contest = contestRepository.save(contest);
        return enrichWithCount(contest);
    }

    @Override
    public DownloadResult downloadRegulations(Long id) {
        Contest contest = findContest(id);
        if (contest.getRegulationsObjectKey() == null) {
            throw new ResourceNotFoundException("Положение конкурса не загружено");
        }
        return new DownloadResult(
                fileStorageService.download(contest.getRegulationsObjectKey()),
                contest.getRegulationsFileName(),
                "application/pdf");
    }

    // ─── Helpers ───

    private Contest findContest(Long id) {
        return contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Конкурс не найден: " + id));
    }

    private ContestResponse enrichWithCount(Contest contest) {
        ContestResponse response = contestMapper.toResponse(contest);
        response.setApplicationsCount(applicationRepository.countByContest_Id(contest.getId()));
        return response;
    }
}
