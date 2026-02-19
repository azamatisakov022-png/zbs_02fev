package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.PayerMapper;
import kg.eco.operator.dto.request.PayerCommentRequest;
import kg.eco.operator.dto.response.*;
import kg.eco.operator.entity.AuditLog;
import kg.eco.operator.entity.Document;
import kg.eco.operator.entity.Payer;
import kg.eco.operator.entity.enums.*;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.AccountRepository;
import kg.eco.operator.repository.AuditLogRepository;
import kg.eco.operator.repository.DocumentRepository;
import kg.eco.operator.repository.PayerRepository;
import kg.eco.operator.service.PayerService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PayerServiceImpl implements PayerService {

    private final PayerRepository payerRepository;
    private final AccountRepository accountRepository;
    private final AuditLogRepository auditLogRepository;
    private final DocumentRepository documentRepository;
    private final PayerMapper payerMapper;

    @Override
    public PaginatedResponse<PayerResponse> getAll(int page, int pageSize, String search,
                                                     String region, String category,
                                                     String systemStatus, String settlementStatus) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("id").descending());

        Specification<Payer> spec = buildSpecification(search, region, category, systemStatus, settlementStatus);
        Page<Payer> payerPage = payerRepository.findAll(spec, pageRequest);

        List<PayerResponse> responses = payerMapper.toResponseList(payerPage.getContent());
        return PaginatedResponse.of(payerPage, responses);
    }

    @Override
    public PayerResponse getById(Long id) {
        Payer payer = findPayerById(id);
        PayerResponse response = payerMapper.toResponse(payer);

        // Populate declarations from calculations (simplified — no declaration items here)
        // Populated lazily from related entities when needed

        return response;
    }

    @Override
    @Transactional
    public SuccessResponse addComment(Long id, String authorInn, PayerCommentRequest request) {
        Payer payer = findPayerById(id);

        // Store comment as AuditLog entry
        AuditLog log = new AuditLog();
        log.setAction("COMMENT");
        log.setEntityType("PAYER");
        log.setEntityId(payer.getId());
        log.setDetails(request.getText());
        log.setUserName(authorInn);
        auditLogRepository.save(log);

        return SuccessResponse.ok("Комментарий добавлен");
    }

    @Override
    @Transactional
    public SuccessResponse addDocument(Long id, MultipartFile file, String type) {
        Payer payer = findPayerById(id);

        Document doc = new Document();
        doc.setName(file.getOriginalFilename());
        doc.setType(kg.eco.operator.entity.enums.DocumentType.OTHER);
        doc.setSize(file.getSize());
        doc.setEntityType("PAYER");
        doc.setEntityId(payer.getId());
        // TODO: Upload to MinIO and set URL
        doc.setUrl("/uploads/payers/" + payer.getId() + "/" + file.getOriginalFilename());
        documentRepository.save(doc);

        return SuccessResponse.ok("Документ прикреплён");
    }

    @Override
    public PayerStatsResponse getStats() {
        long total = payerRepository.count();
        long active = payerRepository.countActive();
        long suspended = payerRepository.countSuspended();
        long withDebt = payerRepository.countWithDebt();

        // Sum from account repository
        BigDecimal totalCharged = accountRepository.sumTotalPaid(); // placeholder
        BigDecimal totalPaid = accountRepository.sumTotalPaid();

        return PayerStatsResponse.builder()
                .total(total)
                .active(active)
                .suspended(suspended)
                .withDebt(withDebt)
                .totalCharged(totalCharged)
                .totalPaid(totalPaid)
                .build();
    }

    // ─── Helpers ───

    private Payer findPayerById(Long id) {
        return payerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Плательщик не найден: " + id));
    }

    private Specification<Payer> buildSpecification(String search, String region,
                                                      String category, String systemStatus,
                                                      String settlementStatus) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Join to company for search
            var companyJoin = root.join("company", jakarta.persistence.criteria.JoinType.LEFT);

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(companyJoin.get("companyName")), pattern),
                        cb.like(companyJoin.get("inn"), "%" + search.trim() + "%")
                ));
            }

            if (region != null && !region.isBlank()) {
                predicates.add(cb.equal(companyJoin.get("region"), region));
            }

            if (category != null && !category.isBlank()) {
                try {
                    PayerCategory cat = PayerCategory.valueOf(category.toUpperCase());
                    predicates.add(cb.equal(root.get("category"), cat));
                } catch (IllegalArgumentException ignored) {
                }
            }

            if (systemStatus != null && !systemStatus.isBlank()) {
                try {
                    SystemStatus ss = SystemStatus.valueOf(systemStatus.toUpperCase());
                    predicates.add(cb.equal(root.get("systemStatus"), ss));
                } catch (IllegalArgumentException ignored) {
                }
            }

            if (settlementStatus != null && !settlementStatus.isBlank()) {
                try {
                    SettlementStatus ss = SettlementStatus.valueOf(settlementStatus.toUpperCase());
                    predicates.add(cb.equal(root.get("settlementStatus"), ss));
                } catch (IllegalArgumentException ignored) {
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
