package kg.eco.operator.service.impl;

import kg.eco.operator.dto.request.CreatePublicationRequest;
import kg.eco.operator.dto.response.PublicationListItemResponse;
import kg.eco.operator.dto.response.PublicationResponse;
import kg.eco.operator.entity.Publication;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.PublicationAuthorOrg;
import kg.eco.operator.entity.enums.PublicationCategory;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.exception.UnauthorizedException;
import kg.eco.operator.repository.PublicationRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.FileStorageService;
import kg.eco.operator.service.PublicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PublicationServiceImpl implements PublicationService {

    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    private static final Pattern NON_SLUG = Pattern.compile("[^a-z0-9-]+");

    // ─── Public read ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<PublicationListItemResponse> listPublic(
            PublicationCategory category, String search, String lang, int page, int size) {
        Page<Publication> p = publicationRepository.findPublic(
                category, search,
                PageRequest.of(page, Math.min(size, 50),
                        Sort.by(Sort.Direction.DESC, "publishedAt")));
        return p.map(pub -> toListItem(pub, lang));
    }

    @Override
    @Transactional(readOnly = true)
    public PublicationListItemResponse getLatest(String lang) {
        Page<Publication> p = publicationRepository.findLatestPublished(PageRequest.of(0, 1));
        if (p.isEmpty()) return null;
        return toListItem(p.getContent().get(0), lang);
    }

    @Override
    public PublicationResponse getBySlug(String slug, String lang) {
        Publication pub = publicationRepository.findBySlugAndIsPublishedTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Публикация не найдена: " + slug));
        // Throttled view counter — простое инкрементирование без debounce.
        // Чистка от роботов / спама — задача более сложного pipeline'а.
        pub.setViewCount(pub.getViewCount() + 1);
        publicationRepository.save(pub);
        return toDetail(pub, lang);
    }

    // ─── Admin read ─────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<PublicationListItemResponse> listForAdmin(int page, int size) {
        User me = currentUser();
        // ECO_OPERATOR и EMPLOYEE видят только свои; ADMIN — всё.
        PublicationAuthorOrg filter = isAdmin(me) ? null : authorOrgForUser(me);
        Page<Publication> p = publicationRepository.findForAdmin(
                filter,
                PageRequest.of(page, Math.min(size, 50),
                        Sort.by(Sort.Direction.DESC, "publishedAt")));
        return p.map(pub -> toListItem(pub, "ru"));
    }

    @Override
    public PublicationResponse getById(Long id) {
        Publication pub = loadAndEnsureWriteAccess(id);
        return toDetail(pub, "ru");
    }

    // ─── Admin write ────────────────────────────────────────────

    @Override
    public PublicationResponse create(CreatePublicationRequest request) {
        User me = currentUser();
        PublicationAuthorOrg authorOrg = authorOrgForUser(me);
        ensureCanPublishCategory(me, request.getCategory());

        Publication pub = new Publication();
        applyRequest(pub, request);
        pub.setAuthorOrg(authorOrg);
        pub.setCreatedById(me.getId());
        pub.setLastEditedById(me.getId());
        pub.setLastEditedAt(LocalDateTime.now());
        pub.setIsPublished(true);
        pub.setPublishedAt(LocalDateTime.now());
        pub.setSlug(buildUniqueSlug(request.getSlug(), request.getTitleRu(), null));

        // cover_url пустой по умолчанию: загрузка через POST /publications/{id}/cover.
        if (pub.getCoverUrl() == null || pub.getCoverUrl().isBlank()) {
            pub.setCoverUrl("");
        }

        publicationRepository.save(pub);
        return toDetail(pub, "ru");
    }

    @Override
    public PublicationResponse update(Long id, CreatePublicationRequest request) {
        Publication pub = loadAndEnsureWriteAccess(id);
        User me = currentUser();
        ensureCanPublishCategory(me, request.getCategory());

        applyRequest(pub, request);
        pub.setLastEditedById(me.getId());
        pub.setLastEditedAt(LocalDateTime.now());
        // Если slug изменился — проверяем уникальность.
        if (request.getSlug() != null && !request.getSlug().equals(pub.getSlug())) {
            pub.setSlug(buildUniqueSlug(request.getSlug(), request.getTitleRu(), pub.getId()));
        }
        publicationRepository.save(pub);
        return toDetail(pub, "ru");
    }

    @Override
    public PublicationResponse uploadCover(Long id, MultipartFile file) {
        Publication pub = loadAndEnsureWriteAccess(id);
        if (file == null || file.isEmpty()) {
            throw new BusinessLogicException("Файл cover-картинки пустой");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessLogicException("Cover должен быть изображением (JPG/PNG/WebP)");
        }
        String objectKey = fileStorageService.upload(file, "publications/" + id);
        pub.setCoverUrl(objectKey);
        pub.setLastEditedAt(LocalDateTime.now());
        pub.setLastEditedById(currentUser().getId());
        publicationRepository.save(pub);
        return toDetail(pub, "ru");
    }

    @Override
    public PublicationResponse unpublish(Long id) {
        Publication pub = loadAndEnsureWriteAccess(id);
        User me = currentUser();
        pub.setIsPublished(false);
        pub.setUnpublishedAt(LocalDateTime.now());
        pub.setUnpublishedById(me.getId());
        publicationRepository.save(pub);
        return toDetail(pub, "ru");
    }

    @Override
    public PublicationResponse publish(Long id) {
        Publication pub = loadAndEnsureWriteAccess(id);
        if (pub.getCoverUrl() == null || pub.getCoverUrl().isBlank()) {
            throw new BusinessLogicException("Перед публикацией загрузите cover-картинку");
        }
        pub.setIsPublished(true);
        pub.setUnpublishedAt(null);
        pub.setUnpublishedById(null);
        if (pub.getPublishedAt() == null) pub.setPublishedAt(LocalDateTime.now());
        publicationRepository.save(pub);
        return toDetail(pub, "ru");
    }

    @Override
    public void delete(Long id) {
        User me = currentUser();
        if (!isAdmin(me)) {
            throw new UnauthorizedException("Удалять публикации может только администратор");
        }
        Publication pub = publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Публикация не найдена: " + id));
        publicationRepository.delete(pub);
    }

    // ─── Mappers ────────────────────────────────────────────────

    private PublicationListItemResponse toListItem(Publication p, String lang) {
        return new PublicationListItemResponse(
                p.getId(), p.getSlug(), p.getCategory(), p.getAuthorOrg(),
                p.getCoverUrl(),
                pickLang(lang, p.getTitleRu(),   p.getTitleKy(),   p.getTitleEn()),
                pickLang(lang, p.getExcerptRu(), p.getExcerptKy(), p.getExcerptEn()),
                p.getReadMinutes(), p.getIsPublished(), p.getPublishedAt());
    }

    private PublicationResponse toDetail(Publication p, String lang) {
        PublicationResponse r = new PublicationResponse();
        r.setId(p.getId());
        r.setSlug(p.getSlug());
        r.setCategory(p.getCategory());
        r.setAuthorOrg(p.getAuthorOrg());
        r.setCoverUrl(p.getCoverUrl());
        r.setTitle(pickLang(lang, p.getTitleRu(),   p.getTitleKy(),   p.getTitleEn()));
        r.setExcerpt(pickLang(lang, p.getExcerptRu(), p.getExcerptKy(), p.getExcerptEn()));
        r.setBody(pickLang(lang,    p.getBodyRu(),    p.getBodyKy(),    p.getBodyEn()));
        r.setHasRu(notBlank(p.getTitleRu()));
        r.setHasKy(notBlank(p.getTitleKy()));
        r.setHasEn(notBlank(p.getTitleEn()));
        r.setReadMinutes(p.getReadMinutes());
        r.setIsPublished(p.getIsPublished());
        r.setPublishedAt(p.getPublishedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        r.setViewCount(p.getViewCount());
        return r;
    }

    private String pickLang(String lang, String ru, String ky, String en) {
        if ("ky".equalsIgnoreCase(lang) && notBlank(ky)) return ky;
        if ("en".equalsIgnoreCase(lang) && notBlank(en)) return en;
        return ru; // fallback на русский
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private void applyRequest(Publication pub, CreatePublicationRequest r) {
        pub.setCategory(r.getCategory());
        pub.setTitleRu(r.getTitleRu());
        pub.setTitleKy(r.getTitleKy());
        pub.setTitleEn(r.getTitleEn());
        pub.setExcerptRu(r.getExcerptRu());
        pub.setExcerptKy(r.getExcerptKy());
        pub.setExcerptEn(r.getExcerptEn());
        pub.setBodyRu(r.getBodyRu());
        pub.setBodyKy(r.getBodyKy());
        pub.setBodyEn(r.getBodyEn());
        if (r.getReadMinutes() != null && r.getReadMinutes() > 0) {
            pub.setReadMinutes(r.getReadMinutes());
        } else if (pub.getReadMinutes() == null) {
            // Авто-оценка: ~250 слов в минуту
            int words = countWords(r.getBodyRu());
            pub.setReadMinutes(Math.max(1, words / 250));
        }
        if (r.getCoverUrl() != null && !r.getCoverUrl().isBlank()) {
            pub.setCoverUrl(r.getCoverUrl());
        }
    }

    private int countWords(String s) {
        if (s == null) return 0;
        return s.trim().isEmpty() ? 0 : s.trim().split("\\s+").length;
    }

    // ─── Slug ───────────────────────────────────────────────────

    private String buildUniqueSlug(String requested, String titleRu, Long excludeId) {
        String base = (requested != null && !requested.isBlank())
                ? toSlug(requested)
                : toSlug(titleRu);
        if (base.isEmpty()) base = "publication";
        String candidate = base;
        int i = 1;
        while (slugTaken(candidate, excludeId)) {
            candidate = base + "-" + (++i);
        }
        return candidate;
    }

    private boolean slugTaken(String slug, Long excludeId) {
        return publicationRepository.findBySlug(slug)
                .map(p -> excludeId == null || !p.getId().equals(excludeId))
                .orElse(false);
    }

    /**
     * Транслит RU → латиница + lowercase + dashes.
     * Минимальная реализация — для production стоит подменить на
     * библиотеку (например com.github.slugify или icu4j).
     */
    private String toSlug(String input) {
        if (input == null) return "";
        String s = transliterate(input);
        s = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        s = s.toLowerCase().replace(" ", "-");
        s = NON_SLUG.matcher(s).replaceAll("-");
        s = s.replaceAll("-+", "-").replaceAll("^-|-$", "");
        if (s.length() > 200) s = s.substring(0, 200);
        return s;
    }

    private String transliterate(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            sb.append(switch (Character.toLowerCase(c)) {
                case 'а' -> "a"; case 'б' -> "b"; case 'в' -> "v"; case 'г' -> "g";
                case 'д' -> "d"; case 'е' -> "e"; case 'ё' -> "yo"; case 'ж' -> "zh";
                case 'з' -> "z"; case 'и' -> "i"; case 'й' -> "y";  case 'к' -> "k";
                case 'л' -> "l"; case 'м' -> "m"; case 'н' -> "n"; case 'о' -> "o";
                case 'п' -> "p"; case 'р' -> "r"; case 'с' -> "s"; case 'т' -> "t";
                case 'у' -> "u"; case 'ф' -> "f"; case 'х' -> "kh"; case 'ц' -> "ts";
                case 'ч' -> "ch"; case 'ш' -> "sh"; case 'щ' -> "sch"; case 'ъ' -> "";
                case 'ы' -> "y"; case 'ь' -> ""; case 'э' -> "e"; case 'ю' -> "yu";
                case 'я' -> "ya"; case 'ң' -> "ng"; case 'ү' -> "u"; case 'ө' -> "o";
                default  -> String.valueOf(c);
            });
        }
        return sb.toString();
    }

    // ─── Auth helpers ───────────────────────────────────────────

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new UnauthorizedException("Требуется авторизация");
        }
        return userRepository.findByInn(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Пользователь не найден: " + auth.getName()));
    }

    private boolean isAdmin(User u) {
        return u.getRole() == RoleEnum.ADMIN;
    }

    /**
     * Маппинг роли пользователя на организацию-автора публикации.
     */
    private PublicationAuthorOrg authorOrgForUser(User u) {
        return switch (u.getRole()) {
            case EMPLOYEE -> PublicationAuthorOrg.MPRETN;
            case ECO_OPERATOR -> PublicationAuthorOrg.ECO_OPERATOR;
            case ADMIN -> PublicationAuthorOrg.ADMIN_GENERIC;
            default -> throw new UnauthorizedException(
                    "Роль " + u.getRole() + " не имеет права публиковать");
        };
    }

    /**
     * Проверка совместимости роли и категории. Конкурсы — только Эко-Оператор
     * и Админ. Для NEWS / REPORT_ANALYTICS / PRESS — все 3 роли.
     */
    private void ensureCanPublishCategory(User u, PublicationCategory cat) {
        if (cat == PublicationCategory.CONTEST) {
            RoleEnum role = u.getRole();
            if (role != RoleEnum.ECO_OPERATOR && role != RoleEnum.ADMIN) {
                throw new UnauthorizedException(
                        "Категорию «Конкурсы» может публиковать только ГП «Эко Оператор»");
            }
        }
    }

    private Publication loadAndEnsureWriteAccess(Long id) {
        Publication pub = publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Публикация не найдена: " + id));
        User me = currentUser();
        if (isAdmin(me)) return pub;
        // Не-админ может редактировать только свои публикации (по author_org)
        PublicationAuthorOrg myOrg = authorOrgForUser(me);
        if (pub.getAuthorOrg() != myOrg) {
            throw new UnauthorizedException(
                    "Вы можете редактировать только публикации своей организации");
        }
        return pub;
    }
}
