package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.LicenseMapper;
import kg.eco.operator.dto.response.LicenseResponse;
import kg.eco.operator.entity.License;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.LicenseType;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.exception.UnauthorizedException;
import kg.eco.operator.repository.LicenseRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.LicenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final LicenseRepository licenseRepository;
    private final UserRepository userRepository;
    private final LicenseMapper mapper;

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
}
