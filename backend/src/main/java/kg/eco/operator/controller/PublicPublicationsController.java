package kg.eco.operator.controller;

import kg.eco.operator.dto.response.PublicationListItemResponse;
import kg.eco.operator.dto.response.PublicationResponse;
import kg.eco.operator.entity.enums.PublicationCategory;
import kg.eco.operator.service.PublicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

/**
 * Публичный API раздела «Публикации» (без авторизации).
 *
 * GET /public/publications              — лента
 * GET /public/publications/latest       — самая свежая (для hero на главной)
 * GET /public/publications/{slug}       — детальная статья
 */
@RestController
@RequestMapping("/public/publications")
@RequiredArgsConstructor
public class PublicPublicationsController {

    private final PublicationService publicationService;

    @GetMapping
    public Page<PublicationListItemResponse> list(
            @RequestParam(required = false) PublicationCategory category,
            @RequestParam(required = false, name = "search") String search,
            @RequestParam(defaultValue = "ru") String lang,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return publicationService.listPublic(category, search, lang, page, size);
    }

    @GetMapping("/latest")
    public PublicationListItemResponse latest(@RequestParam(defaultValue = "ru") String lang) {
        return publicationService.getLatest(lang);
    }

    @GetMapping("/{slug}")
    public PublicationResponse bySlug(
            @PathVariable String slug,
            @RequestParam(defaultValue = "ru") String lang) {
        return publicationService.getBySlug(slug, lang);
    }
}
