package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.LicenseMapper;
import kg.eco.operator.dto.response.LicenseResponse;
import kg.eco.operator.entity.License;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.LicenseType;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.exception.UnauthorizedException;
import kg.eco.operator.repository.LicenseRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.FileStorageService;
import kg.eco.operator.service.LicenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Чтение и управление реестром выданных лицензий.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LicenseServiceImpl implements LicenseService {

    private static final String MINIO_FOLDER = "licenses/documents";
    private static final long MAX_DOC_SIZE = 20L * 1024 * 1024; // 20 МБ — PDF-сканы могут быть крупнее

    private final LicenseRepository licenseRepository;
    private final UserRepository userRepository;
    private final LicenseMapper mapper;
    private final FileStorageService fileStorageService;

    @Override
    public List<LicenseResponse> listAll(LicenseType typeFilter) {
        return licenseRepository.findAll().stream()
                .filter(l -> typeFilter == null || l.getLicenseType() == typeFilter)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LicenseResponse getById(Long id) {
        License l = licenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена: " + id));
        return mapper.toResponse(l);
    }

    @Override
    public LicenseResponse getByNumber(String licenseNumber) {
        License l = licenseRepository.findByLicenseNumber(licenseNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена: " + licenseNumber));
        return mapper.toResponse(l);
    }

    @Override
    public Page<LicenseResponse> listPublished(Pageable pageable, String search) {
        // Пока без поиска по БД — для MVP отфильтруем в памяти на маленьких объёмах.
        // При росте данных — перевести на Specification.
        Page<License> page = licenseRepository.findPublished(pageable);
        if (search == null || search.isBlank()) {
            return page.map(mapper::toResponse);
        }
        String q = search.toLowerCase().trim();
        List<LicenseResponse> filtered = page.getContent().stream()
                .filter(l -> (l.getLicenseNumber() != null && l.getLicenseNumber().toLowerCase().contains(q))
                        || (l.getApplicantInn() != null && l.getApplicantInn().toLowerCase().contains(q))
                        || (l.getApplicantName() != null && l.getApplicantName().toLowerCase().contains(q)))
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
    }

    @Override
    @Transactional
    public LicenseResponse updateVisibility(Long id, Boolean isPublished,
                                             Boolean isRevoked, String revocationReason,
                                             String actorInn) {
        User actor = userRepository.findByInn(actorInn)
                .orElseThrow(() -> new UnauthorizedException("Пользователь не найден: " + actorInn));

        License l = licenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена: " + id));

        if (isPublished != null) l.setIsPublished(isPublished);
        if (isRevoked != null) {
            if (isRevoked && !Boolean.TRUE.equals(l.getIsRevoked())) {
                if (revocationReason == null || revocationReason.isBlank()) {
                    throw new BusinessLogicException("Для отзыва лицензии необходимо указать причину");
                }
                l.setIsRevoked(true);
                l.setRevokedAt(LocalDateTime.now());
                l.setRevocationReason(revocationReason);
                l.setIsPublished(false); // отозванная автоматически скрывается
                log.info("License revoked: number={}, by={}", l.getLicenseNumber(), actorInn);
            } else if (!isRevoked) {
                l.setIsRevoked(false);
                l.setRevokedAt(null);
                l.setRevocationReason(null);
            }
        }
        licenseRepository.save(l);
        return mapper.toResponse(l);
    }

    @Override
    public byte[] exportCsv(LicenseType typeFilter) {
        List<License> licenses = licenseRepository.findAll().stream()
                .filter(l -> typeFilter == null || l.getLicenseType() == typeFilter)
                .sorted((a, b) -> {
                    if (a.getIssuedAt() == null || b.getIssuedAt() == null) return 0;
                    return b.getIssuedAt().compareTo(a.getIssuedAt());
                })
                .collect(Collectors.toList());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter pw = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            // BOM для корректного отображения кириллицы в Excel
            pw.write('\uFEFF');
            pw.println("Номер лицензии;Наименование;ИНН;Вид лицензии;Виды деятельности;Юр. адрес;Дата выдачи;Действует до;Статус");
            for (License l : licenses) {
                pw.println(String.join(";",
                        nz(l.getLicenseNumber()),
                        csvEscape(l.getApplicantName()),
                        nz(l.getApplicantInn()),
                        l.getLicenseType() != null ? l.getLicenseType().getValue() : "",
                        l.getActivityTypes() != null ? String.join(", ", l.getActivityTypes()) : "",
                        csvEscape(l.getLegalAddress()),
                        l.getIssuedAt() != null ? l.getIssuedAt().toString() : "",
                        l.getValidUntil() != null ? l.getValidUntil().toString() : "",
                        Boolean.TRUE.equals(l.getIsRevoked()) ? "отозвана"
                                : Boolean.TRUE.equals(l.getIsPublished()) ? "действует" : "скрыта"
                ));
            }
        }
        return baos.toByteArray();
    }

    private static String nz(String v) { return v == null ? "" : v; }

    private static String csvEscape(String v) {
        if (v == null) return "";
        String safe = v.replace("\"", "\"\"").replace("\n", " ").replace("\r", " ");
        if (safe.contains(";") || safe.contains("\"")) return "\"" + safe + "\"";
        return safe;
    }

    // ─── Загрузка и скачивание PDF подписанной лицензии ───

    @Override
    @Transactional
    public LicenseResponse uploadDocument(Long licenseId, MultipartFile file, String actorInn) {
        if (file == null || file.isEmpty()) {
            throw new BusinessLogicException("Файл не передан");
        }
        if (file.getSize() > MAX_DOC_SIZE) {
            throw new BusinessLogicException("Размер файла превышает 20 МБ");
        }
        User actor = userRepository.findByInn(actorInn)
                .orElseThrow(() -> new UnauthorizedException("Пользователь не найден: " + actorInn));
        if (actor.getRole() != RoleEnum.EMPLOYEE
                && actor.getRole() != RoleEnum.MINISTRY
                && actor.getRole() != RoleEnum.ADMIN) {
            throw new UnauthorizedException("Загружать документ лицензии могут только сотрудники МПРЭТН");
        }

        License license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена: " + licenseId));

        // Если ранее уже был загружен — удаляем старый файл
        if (license.getLicenseDocumentObjectKey() != null) {
            try { fileStorageService.delete(license.getLicenseDocumentObjectKey()); }
            catch (Exception e) {
                log.warn("Failed to delete old license document {}: {}",
                        license.getLicenseDocumentObjectKey(), e.getMessage());
            }
        }

        String objectKey = fileStorageService.upload(file, MINIO_FOLDER);
        license.setLicenseDocumentObjectKey(objectKey);
        license.setLicenseDocumentFileName(file.getOriginalFilename());
        license.setLicenseDocumentUploadedAt(LocalDateTime.now());
        license.setLicenseDocumentUploadedBy(actor);
        licenseRepository.save(license);

        log.info("License document uploaded: licenseNumber={}, by={}, file={}",
                license.getLicenseNumber(), actorInn, file.getOriginalFilename());
        return mapper.toResponse(license);
    }

    @Override
    public LicenseDocumentDownload downloadDocument(Long licenseId, String actorInn) {
        License license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена: " + licenseId));

        User actor = userRepository.findByInn(actorInn)
                .orElseThrow(() -> new UnauthorizedException("Пользователь не найден: " + actorInn));

        boolean isStaff = actor.getRole() == RoleEnum.EMPLOYEE
                || actor.getRole() == RoleEnum.MINISTRY
                || actor.getRole() == RoleEnum.ADMIN
                || actor.getRole() == RoleEnum.ECO_OPERATOR;
        boolean isOwner = license.getApplicantInn() != null
                && license.getApplicantInn().equals(actor.getInn());

        if (!isStaff && !isOwner) {
            throw new UnauthorizedException("Доступ к этой лицензии запрещён");
        }

        return fetchFile(license);
    }

    @Override
    public LicenseDocumentDownload downloadDocumentByNumberPublic(String licenseNumber) {
        License license = licenseRepository.findByLicenseNumber(licenseNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена: " + licenseNumber));

        // Для публичного доступа — только опубликованные и не отозванные.
        if (!Boolean.TRUE.equals(license.getIsPublished()) || Boolean.TRUE.equals(license.getIsRevoked())) {
            throw new ResourceNotFoundException("Лицензия недоступна для публичного скачивания: " + licenseNumber);
        }
        return fetchFile(license);
    }

    private LicenseDocumentDownload fetchFile(License license) {
        if (license.getLicenseDocumentObjectKey() == null) {
            throw new ResourceNotFoundException(
                    "Электронная копия лицензии ещё не загружена сотрудником МПРЭТН");
        }
        try {
            var stream = fileStorageService.download(license.getLicenseDocumentObjectKey());
            return new LicenseDocumentDownload(
                    license.getLicenseDocumentFileName() != null
                            ? license.getLicenseDocumentFileName()
                            : license.getLicenseNumber() + ".pdf",
                    stream,
                    -1 // size unknown from MinIO stream; Content-Length будет transfer-encoding chunked
            );
        } catch (Exception e) {
            log.error("Failed to fetch license document for {}: {}",
                    license.getLicenseNumber(), e.getMessage());
            throw new BusinessLogicException("Не удалось получить файл лицензии: " + e.getMessage());
        }
    }
}
