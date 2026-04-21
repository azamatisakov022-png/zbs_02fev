package kg.eco.operator.service;

import kg.eco.operator.dto.response.LicenseResponse;
import kg.eco.operator.entity.enums.LicenseType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

/**
 * Чтение реестра выданных лицензий.
 * Используется в:
 *   - ЛК сотрудника МПРЭТН (все лицензии, управление публикацией и отзывом)
 *   - ЛК ЭкоОператора (только чтение для проверки наличия лицензии)
 *   - Публичном реестре (без авторизации)
 */
public interface LicenseService {

    List<LicenseResponse> listAll(LicenseType typeFilter);

    LicenseResponse getById(Long id);

    LicenseResponse getByNumber(String licenseNumber);

    Page<LicenseResponse> listPublished(Pageable pageable, String search);

    /** Обновление флагов публикации и отзыва (только для сотрудника МПРЭТН). */
    LicenseResponse updateVisibility(Long id, Boolean isPublished,
                                      Boolean isRevoked, String revocationReason,
                                      String actorInn);

    /** Экспорт реестра в CSV (UTF-8 with BOM). */
    byte[] exportCsv(LicenseType typeFilter);

    // ─── электронная копия подписанной лицензии (PDF) ───

    /** Загрузка сканированного PDF подписанной лицензии сотрудником МПРЭТН. */
    LicenseResponse uploadDocument(Long licenseId, MultipartFile file, String actorInn);

    /** Скачивание PDF-лицензии. Кто может:
     *  - владелец лицензии (по ИНН) — только свою;
     *  - EMPLOYEE / MINISTRY / ADMIN / ECO_OPERATOR — любую. */
    LicenseDocumentDownload downloadDocument(Long licenseId, String actorInn);

    /** Публичное скачивание PDF по номеру лицензии (для проверки подлинности). */
    LicenseDocumentDownload downloadDocumentByNumberPublic(String licenseNumber);

    /** Контейнер для выдачи файла контроллером. */
    record LicenseDocumentDownload(String fileName, InputStream stream, long size) {}
}
