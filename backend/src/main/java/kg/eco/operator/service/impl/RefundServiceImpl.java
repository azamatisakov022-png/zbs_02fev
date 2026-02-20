package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.RefundMapper;
import kg.eco.operator.dto.request.RefundCreateRequest;
import kg.eco.operator.dto.request.RefundRejectRequest;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.RefundResponse;
import kg.eco.operator.entity.Calculation;
import kg.eco.operator.entity.Refund;
import kg.eco.operator.entity.RefundItem;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.RefundReason;
import kg.eco.operator.entity.enums.RefundStatus;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.CalculationRepository;
import kg.eco.operator.repository.RefundRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.event.RefundStatusEvent;
import kg.eco.operator.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final CalculationRepository calculationRepository;
    private final UserRepository userRepository;
    private final RefundMapper refundMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public List<RefundResponse> getAll(String status) {
        List<Refund> refunds;

        if (status != null && !status.isBlank()) {
            try {
                RefundStatus rs = RefundStatus.valueOf(status.toUpperCase());
                refunds = refundRepository.findByStatus(rs);
            } catch (IllegalArgumentException e) {
                refunds = refundRepository.findAll();
            }
        } else {
            refunds = refundRepository.findAll();
        }

        return refundMapper.toResponseList(refunds);
    }

    @Override
    @Transactional
    public RefundResponse create(String userInn, RefundCreateRequest request) {
        User user = userRepository.findByInn(userInn)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        Refund refund = new Refund();
        refund.setCompany(user.getCompany());
        refund.setNumber(generateNumber());
        refund.setComment(request.getComment());
        refund.setStatus(RefundStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;

        refund = refundRepository.save(refund);

        for (RefundCreateRequest.RefundItemRequest itemReq : request.getItems()) {
            Calculation calc = calculationRepository.findById(itemReq.getCalculationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Расчёт не найден: " + itemReq.getCalculationId()));

            RefundItem item = new RefundItem();
            item.setRefund(refund);
            item.setCalculation(calc);
            item.setAmount(itemReq.getAmount());

            try {
                item.setReason(RefundReason.valueOf(itemReq.getReason().toUpperCase()));
            } catch (IllegalArgumentException e) {
                item.setReason(RefundReason.ERROR);
            }

            refund.getItems().add(item);
            total = total.add(itemReq.getAmount());
        }

        refund.setTotalAmount(total);
        refund = refundRepository.save(refund);

        return refundMapper.toResponse(refund);
    }

    @Override
    public RefundResponse getById(Long id) {
        Refund refund = findRefundById(id);
        return refundMapper.toResponse(refund);
    }

    @Override
    @Transactional
    public RefundResponse approve(Long id) {
        Refund refund = findRefundById(id);

        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new BusinessLogicException("Можно одобрить только заявку со статусом 'pending'");
        }

        refund.setStatus(RefundStatus.APPROVED);
        refund = refundRepository.save(refund);
        publishRefundEvent(refund, "pending", "approved", null);

        return refundMapper.toResponse(refund);
    }

    @Override
    @Transactional
    public RefundResponse reject(Long id, RefundRejectRequest request) {
        Refund refund = findRefundById(id);

        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new BusinessLogicException("Можно отклонить только заявку со статусом 'pending'");
        }

        refund.setStatus(RefundStatus.REJECTED);
        String reason = request != null ? request.getReason() : null;
        if (reason != null) {
            refund.setComment(reason);
        }
        refund = refundRepository.save(refund);
        publishRefundEvent(refund, "pending", "rejected", reason);

        return refundMapper.toResponse(refund);
    }

    @Override
    public CountResponse getPendingCount() {
        long count = refundRepository.countByStatus(RefundStatus.PENDING);
        return new CountResponse(count);
    }

    // ─── Helpers ───

    private Refund findRefundById(Long id) {
        return refundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Заявка на возврат не найдена: " + id));
    }

    private void publishRefundEvent(Refund refund, String oldStatus, String newStatus, String comment) {
        Long userId = null;
        if (refund.getCompany() != null) {
            userId = userRepository.findFirstByCompany_Id(refund.getCompany().getId())
                    .map(User::getId)
                    .orElse(null);
        }
        eventPublisher.publishEvent(new RefundStatusEvent(
                refund.getId(), refund.getNumber(), userId,
                oldStatus, newStatus, comment));
    }

    private String generateNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long maxNum = refundRepository.findMaxNumberForYear(year);
        return String.format("ВОЗ-%s-%06d", year, maxNum + 1);
    }
}
