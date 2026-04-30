package kg.eco.operator.service;

import kg.eco.operator.dto.request.CreatePublicationRequest;
import kg.eco.operator.dto.response.PublicationListItemResponse;
import kg.eco.operator.dto.response.PublicationResponse;
import kg.eco.operator.entity.enums.PublicationCategory;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface PublicationService {

    /** Публичная лента — только опубликованные публикации. */
    Page<PublicationListItemResponse> listPublic(
            PublicationCategory category, String search, String lang,
            int page, int size);

    /** Публикация по slug (для публичной детальной страницы). */
    PublicationResponse getBySlug(String slug, String lang);

    /** Самая свежая опубликованная — для hero-секции на главной. */
    PublicationListItemResponse getLatest(String lang);

    /** Список для админки (с возможностью видеть и снятые с публикации). */
    Page<PublicationListItemResponse> listForAdmin(int page, int size);

    /** Получить публикацию по id (для админ-формы редактирования). */
    PublicationResponse getById(Long id);

    /** Создать. */
    PublicationResponse create(CreatePublicationRequest request);

    /** Обновить. */
    PublicationResponse update(Long id, CreatePublicationRequest request);

    /** Загрузить cover-картинку (multipart). */
    PublicationResponse uploadCover(Long id, MultipartFile file);

    /** Снять с публикации (не удаляет, оставляет в БД). */
    PublicationResponse unpublish(Long id);

    /** Снова опубликовать. */
    PublicationResponse publish(Long id);

    /** Удалить (только админ). */
    void delete(Long id);
}
