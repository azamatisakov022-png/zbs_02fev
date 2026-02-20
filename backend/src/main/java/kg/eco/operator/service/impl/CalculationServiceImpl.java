package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.CalculationMapper;
import kg.eco.operator.dto.request.*;
import kg.eco.operator.dto.response.CalculationResponse;
import kg.eco.operator.dto.response.DocumentResponse;
import kg.eco.operator.dto.response.PaginatedResponse;
import kg.eco.operator.dto.response.PaymentResponse;
import kg.eco.operator.entity.*;
import kg.eco.operator.entity.enums.*;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.*;
import kg.eco.operator.event.CalculationStatusEvent;
import kg.eco.operator.service.CalculationService;
import kg.eco.operator.util.CalculationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalculationServiceImpl implements CalculationService {

    private final CalculationRepository calculationRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PaymentRepository paymentRepository;
    private final DocumentRepository documentRepository;
    private final CalculationMapper calculationMapper;
    private final ApplicationEventPublisher eventPublisher;

    // ─── LIST ───

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<CalculationResponse> getCalculations(
            String inn, int page, int pageSize,
            String search, String status, String periodFrom, String periodTo, String productGroup) {

        User user = findUserByInn(inn);
        Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Calculation> spec = Specification.where(null);

        // Business users see only their calculations
        if (user.getRole() == RoleEnum.BUSINESS) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("company").get("id"), user.getCompany().getId()));
        }

        // Eco-operator/employee see submitted+ calculations by default
        if (user.getRole() == RoleEnum.ECO_OPERATOR || user.getRole() == RoleEnum.EMPLOYEE) {
            if (status == null) {
                spec = spec.and((root, query, cb) ->
                        root.get("status").in(
                                CalculationStatus.SUBMITTED,
                                CalculationStatus.UNDER_REVIEW,
                                CalculationStatus.APPROVED,
                                CalculationStatus.REJECTED,
                                CalculationStatus.PAID,
                                CalculationStatus.PARTIALLY_PAID
                        ));
            }
        }

        if (status != null && !status.isBlank()) {
            CalculationStatus cs = CalculationStatus.valueOf(status.toUpperCase());
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), cs));
        }

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("number")), pattern),
                    cb.like(cb.lower(root.get("company").get("companyName")), pattern),
                    cb.like(root.get("company").get("inn"), pattern)
            ));
        }

        if (periodFrom != null && !periodFrom.isBlank()) {
            LocalDate from = LocalDate.parse(periodFrom);
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("documentDate"), from));
        }
        if (periodTo != null && !periodTo.isBlank()) {
            LocalDate to = LocalDate.parse(periodTo);
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("documentDate"), to));
        }

        Page<Calculation> pageResult = calculationRepository.findAll(spec, pageable);
        List<CalculationResponse> data = pageResult.getContent().stream()
                .map(this::toFullResponse)
                .toList();

        return PaginatedResponse.of(pageResult, data);
    }

    // ─── GET BY ID ───

    @Override
    @Transactional(readOnly = true)
    public CalculationResponse getById(Long id) {
        Calculation calc = findById(id);
        return toFullResponse(calc);
    }

    // ─── CREATE ───

    @Override
    @Transactional
    public CalculationResponse create(String inn, CalculationCreateRequest request) {
        User user = findUserByInn(inn);
        Company company = user.getCompany();
        if (company == null) {
            throw new BusinessLogicException("Пользователь не привязан к компании");
        }

        Calculation calc = new Calculation();
        calc.setNumber(generateNumber());
        calc.setCompany(company);
        calc.setPeriod(request.getPeriod());
        calc.setQuarter(request.getQuarter());
        calc.setDocumentType(request.getDocumentType());
        calc.setDocumentNumber(request.getDocumentNumber());
        calc.setDocumentDate(request.getDocumentDate());
        calc.setStatus(CalculationStatus.DRAFT);

        calc = calculationRepository.save(calc);

        List<CalculationItem> items = buildItems(calc, request.getItems());
        calc.setItems(items);
        calc.setTotalAmount(sumAmounts(items));
        calc = calculationRepository.save(calc);

        return toFullResponse(calc);
    }

    // ─── UPDATE ───

    @Override
    @Transactional
    public CalculationResponse update(Long id, String inn, CalculationCreateRequest request) {
        Calculation calc = findById(id);
        assertOwner(calc, inn);
        assertStatus(calc, CalculationStatus.DRAFT, CalculationStatus.REJECTED);

        calc.setPeriod(request.getPeriod());
        calc.setQuarter(request.getQuarter());
        calc.setDocumentType(request.getDocumentType());
        calc.setDocumentNumber(request.getDocumentNumber());
        calc.setDocumentDate(request.getDocumentDate());

        calc.getItems().clear();
        List<CalculationItem> items = buildItems(calc, request.getItems());
        calc.getItems().addAll(items);
        calc.setTotalAmount(sumAmounts(items));

        // If rejected, reset to draft on edit
        if (calc.getStatus() == CalculationStatus.REJECTED) {
            calc.setStatus(CalculationStatus.DRAFT);
            calc.setReviewComment(null);
            calc.setReviewedBy(null);
            calc.setReviewedAt(null);
        }

        calc = calculationRepository.save(calc);
        return toFullResponse(calc);
    }

    // ─── DELETE DRAFT ───

    @Override
    @Transactional
    public void deleteDraft(Long id, String inn) {
        Calculation calc = findById(id);
        assertOwner(calc, inn);
        assertStatus(calc, CalculationStatus.DRAFT);
        calculationRepository.delete(calc);
    }

    // ─── SUBMIT ───

    @Override
    @Transactional
    public CalculationResponse submit(Long id, String inn) {
        Calculation calc = findById(id);
        assertOwner(calc, inn);
        assertStatus(calc, CalculationStatus.DRAFT);

        if (calc.getItems().isEmpty()) {
            throw new BusinessLogicException("Невозможно подать расчёт без позиций");
        }

        calc.setStatus(CalculationStatus.SUBMITTED);
        calc.setSubmittedAt(LocalDateTime.now());
        calc = calculationRepository.save(calc);
        publishCalcEvent(calc, "draft", "submitted", null);
        return toFullResponse(calc);
    }

    // ─── RESUBMIT ───

    @Override
    @Transactional
    public CalculationResponse resubmit(Long id, String inn) {
        Calculation calc = findById(id);
        assertOwner(calc, inn);
        assertStatus(calc, CalculationStatus.REJECTED);

        calc.setStatus(CalculationStatus.SUBMITTED);
        calc.setSubmittedAt(LocalDateTime.now());
        calc.setReviewComment(null);
        calc.setReviewedBy(null);
        calc.setReviewedAt(null);
        calc = calculationRepository.save(calc);
        publishCalcEvent(calc, "rejected", "submitted", null);
        return toFullResponse(calc);
    }

    // ─── APPROVE ───

    @Override
    @Transactional
    public CalculationResponse approve(Long id, String reviewerInn, ReviewRequest request) {
        Calculation calc = findById(id);
        assertStatus(calc, CalculationStatus.SUBMITTED, CalculationStatus.UNDER_REVIEW);

        User reviewer = findUserByInn(reviewerInn);

        calc.setStatus(CalculationStatus.APPROVED);
        calc.setReviewedBy(reviewer.getCompanyName());
        calc.setReviewedAt(LocalDateTime.now());
        if (request != null && request.getComment() != null) {
            calc.setReviewComment(request.getComment());
        }

        calc = calculationRepository.save(calc);
        publishCalcEvent(calc, "submitted", "approved", request != null ? request.getComment() : null);
        return toFullResponse(calc);
    }

    // ─── REJECT ───

    @Override
    @Transactional
    public CalculationResponse reject(Long id, String reviewerInn, ReviewRequest request) {
        Calculation calc = findById(id);
        assertStatus(calc, CalculationStatus.SUBMITTED, CalculationStatus.UNDER_REVIEW);

        if (request == null || request.getComment() == null || request.getComment().isBlank()) {
            throw new BusinessLogicException("Причина отклонения обязательна");
        }

        User reviewer = findUserByInn(reviewerInn);

        calc.setStatus(CalculationStatus.REJECTED);
        calc.setReviewComment(request.getComment());
        calc.setReviewedBy(reviewer.getCompanyName());
        calc.setReviewedAt(LocalDateTime.now());

        calc = calculationRepository.save(calc);
        publishCalcEvent(calc, "submitted", "rejected", request.getComment());
        return toFullResponse(calc);
    }

    // ─── PAYMENT ───

    @Override
    @Transactional
    public CalculationResponse submitPayment(Long id, String inn, PaymentSubmitRequest request, MultipartFile document) {
        Calculation calc = findById(id);
        assertOwner(calc, inn);
        assertStatus(calc, CalculationStatus.APPROVED);

        Payment payment = new Payment();
        payment.setPaymentNumber(generatePaymentNumber());
        payment.setCalculation(calc);
        payment.setCompany(calc.getCompany());
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        payment.setStatus(PaymentConfirmationStatus.PENDING);

        // TODO: upload document to MinIO and set documentUrl
        if (document != null && !document.isEmpty()) {
            payment.setDocumentUrl("/documents/payments/" + payment.getPaymentNumber());
        }

        paymentRepository.save(payment);
        return toFullResponse(calc);
    }

    @Override
    @Transactional
    public CalculationResponse approvePayment(Long id, String reviewerInn) {
        Calculation calc = findById(id);
        Payment payment = findPaymentByCalculation(calc);

        payment.setStatus(PaymentConfirmationStatus.CONFIRMED);
        paymentRepository.save(payment);

        // If fully paid
        if (payment.getAmount().compareTo(calc.getTotalAmount()) >= 0) {
            calc.setStatus(CalculationStatus.PAID);
        } else {
            calc.setStatus(CalculationStatus.PARTIALLY_PAID);
        }
        calculationRepository.save(calc);
        publishCalcEvent(calc, "approved", "payment_confirmed", null);

        return toFullResponse(calc);
    }

    @Override
    @Transactional
    public CalculationResponse rejectPayment(Long id, String reviewerInn, ReviewRequest request) {
        Calculation calc = findById(id);
        Payment payment = findPaymentByCalculation(calc);

        payment.setStatus(PaymentConfirmationStatus.REJECTED);
        paymentRepository.save(payment);
        publishCalcEvent(calc, "approved", "payment_rejected",
                request != null ? request.getComment() : null);

        return toFullResponse(calc);
    }

    @Override
    @Transactional
    public CalculationResponse markAsPaid(Long id, String reviewerInn) {
        Calculation calc = findById(id);
        assertStatus(calc, CalculationStatus.APPROVED, CalculationStatus.PARTIALLY_PAID);

        calc.setStatus(CalculationStatus.PAID);
        calc = calculationRepository.save(calc);
        publishCalcEvent(calc, "approved", "payment_confirmed", null);
        return toFullResponse(calc);
    }

    // ─── COPY ───

    @Override
    @Transactional
    public CalculationResponse copy(Long id, String inn) {
        Calculation original = findById(id);
        User user = findUserByInn(inn);

        Calculation copy = new Calculation();
        copy.setNumber(generateNumber());
        copy.setCompany(user.getCompany());
        copy.setPeriod(original.getPeriod());
        copy.setQuarter(original.getQuarter());
        copy.setDocumentType(original.getDocumentType());
        copy.setDocumentNumber(null);
        copy.setDocumentDate(null);
        copy.setStatus(CalculationStatus.DRAFT);

        copy = calculationRepository.save(copy);

        List<CalculationItem> copiedItems = new ArrayList<>();
        for (CalculationItem orig : original.getItems()) {
            CalculationItem item = new CalculationItem();
            item.setCalculation(copy);
            item.setProductGroup(orig.getProductGroup());
            item.setProductSubgroup(orig.getProductSubgroup());
            item.setTnvedCode(orig.getTnvedCode());
            item.setGskpCode(orig.getGskpCode());
            item.setProductName(orig.getProductName());
            item.setQuantity(orig.getQuantity());
            item.setUnit(orig.getUnit());
            item.setWeight(orig.getWeight());
            item.setRate(orig.getRate());
            item.setAmount(orig.getAmount());
            item.setRecyclingNorm(orig.getRecyclingNorm());
            copiedItems.add(item);
        }
        copy.setItems(copiedItems);
        copy.setTotalAmount(sumAmounts(copiedItems));
        copy = calculationRepository.save(copy);

        return toFullResponse(copy);
    }

    // ─── UPDATE ITEMS ───

    @Override
    @Transactional
    public CalculationResponse updateItems(Long id, String inn, UpdateItemsRequest request) {
        Calculation calc = findById(id);
        assertOwner(calc, inn);
        assertStatus(calc, CalculationStatus.DRAFT, CalculationStatus.REJECTED);

        calc.getItems().clear();
        List<CalculationItem> items = buildItems(calc, request.getItems());
        calc.getItems().addAll(items);
        calc.setTotalAmount(sumAmounts(items));

        calc = calculationRepository.save(calc);
        return toFullResponse(calc);
    }

    // ─── UPDATE DOCUMENTS ───

    @Override
    @Transactional
    public void updateDocuments(Long id, String inn, MultipartFile[] files) {
        Calculation calc = findById(id);
        assertOwner(calc, inn);
        // TODO: implement MinIO upload
    }

    // ─── COUNTS ───

    @Override
    @Transactional(readOnly = true)
    public long getPendingCount(String inn) {
        User user = findUserByInn(inn);
        if (user.getRole() == RoleEnum.BUSINESS) {
            return calculationRepository.countByStatusIn(List.of(
                    CalculationStatus.SUBMITTED, CalculationStatus.UNDER_REVIEW));
        }
        return calculationRepository.countByStatus(CalculationStatus.SUBMITTED);
    }

    @Override
    @Transactional(readOnly = true)
    public long getReviewCount() {
        return calculationRepository.countByStatusIn(List.of(
                CalculationStatus.SUBMITTED, CalculationStatus.UNDER_REVIEW));
    }

    // ════════════════════════════════════
    //  PRIVATE HELPERS
    // ════════════════════════════════════

    private Calculation findById(Long id) {
        return calculationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Расчёт", id));
    }

    private User findUserByInn(String inn) {
        return userRepository.findByInn(inn)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь", "ИНН", inn));
    }

    private void assertOwner(Calculation calc, String inn) {
        User user = findUserByInn(inn);
        if (user.getCompany() == null ||
                !calc.getCompany().getId().equals(user.getCompany().getId())) {
            throw new BusinessLogicException("Нет доступа к данному расчёту");
        }
    }

    private void assertStatus(Calculation calc, CalculationStatus... allowed) {
        for (CalculationStatus s : allowed) {
            if (calc.getStatus() == s) return;
        }
        throw new BusinessLogicException(
                "Операция недоступна для расчёта в статусе " + calc.getStatus());
    }

    private List<CalculationItem> buildItems(Calculation calc, List<ProductItemRequest> requests) {
        List<CalculationItem> items = new ArrayList<>();
        for (ProductItemRequest req : requests) {
            CalculationItem item = new CalculationItem();
            item.setCalculation(calc);
            item.setProductGroup(req.getProductGroup());
            item.setProductSubgroup(req.getProductSubgroup());
            item.setTnvedCode(req.getTnvedCode());
            item.setGskpCode(req.getGskpCode());
            item.setProductName(req.getProductName());
            item.setQuantity(req.getQuantity());
            item.setUnit(req.getUnit());
            item.setWeight(req.getWeight());
            item.setRate(req.getRate());
            item.setRecyclingNorm(req.getRecyclingNorm());

            // Calculate amount: rate × weight × (1 - norm/100)
            BigDecimal amount = CalculationUtil.calculateItemAmount(
                    req.getRate(), req.getWeight(), req.getRecyclingNorm());
            item.setAmount(amount);

            items.add(item);
        }
        return items;
    }

    private BigDecimal sumAmounts(List<CalculationItem> items) {
        return items.stream()
                .map(CalculationItem::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String generateNumber() {
        String prefix = "РС-" + Year.now().getValue() + "-";
        // Simple sequential: find max existing number
        long count = calculationRepository.count() + 1;
        return prefix + String.format("%06d", count);
    }

    private String generatePaymentNumber() {
        long count = paymentRepository.count() + 1;
        return "ПП-" + Year.now().getValue() + "-" + String.format("%04d", count);
    }

    private Payment findPaymentByCalculation(Calculation calc) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getCalculation() != null && p.getCalculation().getId().equals(calc.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Платёж не найден для расчёта " + calc.getNumber()));
    }

    private void publishCalcEvent(Calculation calc, String oldStatus, String newStatus, String comment) {
        Long userId = null;
        if (calc.getCompany() != null) {
            userId = userRepository.findFirstByCompany_Id(calc.getCompany().getId())
                    .map(User::getId)
                    .orElse(null);
        }
        eventPublisher.publishEvent(new CalculationStatusEvent(
                calc.getId(), calc.getNumber(),
                calc.getCompany() != null ? calc.getCompany().getId() : null,
                userId, oldStatus, newStatus, comment,
                calc.getCompany() != null ? calc.getCompany().getCompanyName() : null,
                calc.getTotalAmount()));
    }

    private CalculationResponse toFullResponse(Calculation calc) {
        CalculationResponse response = calculationMapper.toResponse(calc);

        // Load documents
        List<Document> docs = documentRepository.findByEntityTypeAndEntityId("calculation", calc.getId());
        response.setDocuments(calculationMapper.toDocumentResponseList(docs));

        // Load payment
        paymentRepository.findAll().stream()
                .filter(p -> p.getCalculation() != null && p.getCalculation().getId().equals(calc.getId()))
                .findFirst()
                .ifPresent(p -> response.setPayment(calculationMapper.toPaymentResponse(p)));

        return response;
    }
}
