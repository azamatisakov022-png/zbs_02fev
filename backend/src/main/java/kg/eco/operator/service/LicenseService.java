package kg.eco.operator.service;

import kg.eco.operator.dto.response.LicenseResponse;
import kg.eco.operator.entity.enums.LicenseType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
}
