package kg.eco.operator.controller;

import kg.eco.operator.dto.response.LicenseResponse;
import kg.eco.operator.entity.enums.LicenseApplicationStatus;
import kg.eco.operator.entity.enums.LicenseDocumentType;
import kg.eco.operator.entity.enums.LicenseType;
import kg.eco.operator.entity.enums.RejectionReason;
import kg.eco.operator.service.LicenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Публичные эндпоинты реестра лицензий и справочников.
 * Доступны без авторизации (путь /public/** разрешён в SecurityConfig).
 */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicLicenseController {

    private final LicenseService licenseService;

    @GetMapping("/licenses")
    public ResponseEntity<Page<LicenseResponse>> listPublished(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "issuedAt"));
        return ResponseEntity.ok(licenseService.listPublished(pageable, search));
    }

    @GetMapping("/licenses/{licenseNumber:.+}")
    public ResponseEntity<LicenseResponse> getByNumber(@PathVariable String licenseNumber) {
        return ResponseEntity.ok(licenseService.getByNumber(licenseNumber));
    }

    /** Публичное скачивание PDF-скана лицензии по номеру — для проверки подлинности. */
    @GetMapping("/licenses/{licenseNumber:.+}/document")
    public ResponseEntity<InputStreamResource> downloadDocument(@PathVariable String licenseNumber) {
        var result = licenseService.downloadDocumentByNumberPublic(licenseNumber);
        String filename = result.fileName();
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(result.stream()));
    }

    // ─── справочники (enum'ы) ───

    @GetMapping("/enums/license-types")
    public ResponseEntity<List<EnumItem>> licenseTypes() {
        return ResponseEntity.ok(Arrays.stream(LicenseType.values())
                .map(v -> new EnumItem(v.getValue(), v.name(), labelForLicenseType(v)))
                .collect(Collectors.toList()));
    }

    @GetMapping("/enums/rejection-reasons")
    public ResponseEntity<List<EnumItem>> rejectionReasons() {
        return ResponseEntity.ok(Arrays.stream(RejectionReason.values())
                .map(v -> new EnumItem(v.getValue(), v.name(), labelForRejectionReason(v)))
                .collect(Collectors.toList()));
    }

    @GetMapping("/enums/application-statuses")
    public ResponseEntity<List<EnumItem>> applicationStatuses() {
        return ResponseEntity.ok(Arrays.stream(LicenseApplicationStatus.values())
                .map(v -> new EnumItem(v.getValue(), v.name(), labelForStatus(v)))
                .collect(Collectors.toList()));
    }

    @GetMapping("/enums/document-types")
    public ResponseEntity<List<EnumItem>> documentTypes(
            @RequestParam(required = false) LicenseType licenseType) {
        java.util.Set<LicenseDocumentType> required = licenseType != null
                ? LicenseDocumentType.requiredFor(licenseType)
                : java.util.EnumSet.allOf(LicenseDocumentType.class);
        return ResponseEntity.ok(Arrays.stream(LicenseDocumentType.values())
                .map(v -> {
                    Map<String, Object> extra = new LinkedHashMap<>();
                    extra.put("required", required.contains(v));
                    return new EnumItem(v.getValue(), v.name(), labelForDocumentType(v), extra);
                })
                .collect(Collectors.toList()));
    }

    // ─── русские лейблы для отображения на фронте ───

    private static String labelForLicenseType(LicenseType t) {
        return switch (t) {
            case COLLECTION -> "Сбор";
            case TRANSPORTATION -> "Транспортировка";
            case PROCESSING -> "Обработка (переработка)";
            case NEUTRALIZATION -> "Обезвреживание (уничтожение)";
            case STORAGE_DISPOSAL -> "Хранение (захоронение)";
            case COMPLEX -> "Комплексная";
        };
    }

    private static String labelForRejectionReason(RejectionReason r) {
        return switch (r) {
            case LEGAL_PROHIBITION -> "Запрет законодательства для данной категории субъектов";
            case COURT_DECISION -> "Решение суда, запрещающее деятельность";
            case INVALID_INFO -> "Недостоверная или неполная информация";
            case DOCUMENTS_MISMATCH -> "Документы не соответствуют требованиям";
            case FEE_NOT_PAID -> "Государственная пошлина не внесена";
        };
    }

    private static String labelForStatus(LicenseApplicationStatus s) {
        return switch (s) {
            case DRAFT -> "Черновик";
            case PAYMENT_PENDING -> "Ожидает оплаты";
            case SUBMITTED -> "Подана";
            case UNDER_REVIEW -> "На рассмотрении";
            case SITE_VISIT_DONE -> "Выезд проведён";
            case APPROVED -> "Лицензия выдана";
            case REJECTED -> "Отклонена";
        };
    }

    private static String labelForDocumentType(LicenseDocumentType t) {
        return switch (t) {
            case APPLICATION_FORM -> "Заявление установленной формы";
            case REGISTRATION_CERT -> "Свидетельство о госрегистрации юрлица / ИП";
            case PAYMENT_RECEIPT -> "Квитанция об оплате госпошлины";
            case WASTE_OBJECT_OWNERSHIP -> "Документы о праве на объекты размещения отходов";
            case ECO_EXPERTISE_REPORT -> "Заключение государственной экологической экспертизы";
            case ECO_JUSTIFICATION -> "Экологическое обоснование деятельности";
            case SECURITY_ORDER -> "Приказ или договор об охране объекта";
            case SANITARY_FIRE_APPROVAL -> "Заключение санэпиднадзора и пожарной инспекции";
            case QUALITY_CONTROL_INFO -> "Информация о системе контроля качества работ";
            case MEASURING_EQUIPMENT_LIST -> "Перечень средств измерений и испытательного оборудования";
            case METROLOGY_CERTIFICATES -> "Документы о поверке / метрологической аттестации";
            case PERSONNEL_INFO -> "Информация о сотрудниках (ИТР)";
        };
    }

    // ─── DTO для enum ───

    public static class EnumItem {
        public String value;
        public String name;
        public String labelRu;
        public Map<String, Object> extra;

        public EnumItem(String value, String name, String labelRu) {
            this.value = value;
            this.name = name;
            this.labelRu = labelRu;
        }

        public EnumItem(String value, String name, String labelRu, Map<String, Object> extra) {
            this(value, name, labelRu);
            this.extra = extra;
        }

        public String getValue() { return value; }
        public String getName() { return name; }
        public String getLabelRu() { return labelRu; }
        public Map<String, Object> getExtra() { return extra; }
    }
}
