package kg.eco.operator.service;

import kg.eco.operator.dto.request.ReportCreateRequest;
import kg.eco.operator.dto.response.PaginatedResponse;
import kg.eco.operator.dto.response.ReportResponse;
import kg.eco.operator.entity.Recycler;
import kg.eco.operator.entity.Report;
import kg.eco.operator.entity.ReportItem;
import kg.eco.operator.entity.enums.ReportStatus;
import kg.eco.operator.event.ReportStatusEvent;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.RecyclerRepository;
import kg.eco.operator.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final RecyclerRepository recyclerRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PaginatedResponse<ReportResponse> getReports(int page, int pageSize) {
        Page<Report> reportPage = reportRepository.findAll(
                PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<ReportResponse> data = reportPage.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PaginatedResponse.of(reportPage, data);
    }

    public PaginatedResponse<ReportResponse> getMyReports(String userInn, int page, int pageSize) {
        Page<Report> reportPage = reportRepository.findBySubmitterInn(userInn,
                PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<ReportResponse> data = reportPage.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PaginatedResponse.of(reportPage, data);
    }

    public ReportResponse getById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Отчёт с ID " + id + " не найден"));
        return toResponse(report);
    }

    @Transactional
    public ReportResponse create(String userInn, ReportCreateRequest request) {
        // Try to find recycler by user INN or request INN
        Recycler recycler = recyclerRepository.findByInn(userInn).orElse(null);
        if (recycler == null && request.getInn() != null) {
            recycler = recyclerRepository.findByInn(request.getInn()).orElse(null);
        }

        // Generate report number
        long count = reportRepository.count();
        String number = "РП-" + LocalDateTime.now().getYear() + "-" + String.format("%03d", count + 1);

        Report report = new Report();
        report.setNumber(number);
        report.setRecycler(recycler);
        report.setSubmitterInn(userInn);
        report.setPeriod(request.getYear());
        report.setStatus(ReportStatus.DRAFT);
        report = reportRepository.save(report);

        // Create items
        if (request.getItems() != null) {
            for (ReportCreateRequest.ReportItemRequest itemReq : request.getItems()) {
                ReportItem item = new ReportItem();
                item.setReport(report);
                item.setWasteGroup(itemReq.getWasteType() != null ? itemReq.getWasteType() : "");
                item.setWasteCode(itemReq.getWasteCode());
                item.setVolumeReceived(parseBigDecimal(itemReq.getDeclared()));
                item.setVolumeProcessed(parseBigDecimal(itemReq.getProcessed()));
                report.getItems().add(item);
            }
            report = reportRepository.save(report);
        }

        return toResponse(report);
    }

    @Transactional
    public ReportResponse submit(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Отчёт с ID " + id + " не найден"));
        if (report.getStatus() != ReportStatus.DRAFT && report.getStatus() != ReportStatus.REVISION_REQUESTED) {
            throw new BusinessLogicException("Отправить можно только черновик или отчёт на доработке");
        }
        report.setStatus(ReportStatus.SUBMITTED);
        report.setSubmittedAt(LocalDateTime.now());
        report = reportRepository.save(report);
        publishReportEvent(report, "draft", "submitted", null);
        return toResponse(report);
    }

    @Transactional
    public ReportResponse approve(Long id, String comment) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Отчёт с ID " + id + " не найден"));
        if (report.getStatus() != ReportStatus.SUBMITTED) {
            throw new BusinessLogicException("Одобрить можно только отчёт на рассмотрении");
        }
        report.setStatus(ReportStatus.APPROVED);
        report = reportRepository.save(report);
        publishReportEvent(report, "submitted", "approved", comment);
        return toResponse(report);
    }

    @Transactional
    public ReportResponse reject(Long id, String reason) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Отчёт с ID " + id + " не найден"));
        if (report.getStatus() != ReportStatus.SUBMITTED) {
            throw new BusinessLogicException("Отклонить можно только отчёт на рассмотрении");
        }
        if (reason == null || reason.isBlank()) {
            throw new BusinessLogicException("Причина отклонения обязательна");
        }
        report.setStatus(ReportStatus.REJECTED);
        report = reportRepository.save(report);
        publishReportEvent(report, "submitted", "rejected", reason);
        return toResponse(report);
    }

    @Transactional
    public ReportResponse returnForRevision(Long id, String comment) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Отчёт с ID " + id + " не найден"));
        if (report.getStatus() != ReportStatus.SUBMITTED) {
            throw new BusinessLogicException("Вернуть на доработку можно только отчёт на рассмотрении");
        }
        report.setStatus(ReportStatus.REVISION_REQUESTED);
        report = reportRepository.save(report);
        publishReportEvent(report, "submitted", "revision_requested", comment);
        return toResponse(report);
    }

    public long getPendingCount() {
        return reportRepository.findByStatus(ReportStatus.SUBMITTED, PageRequest.of(0, 1))
                .getTotalElements();
    }

    private void publishReportEvent(Report report, String oldStatus, String newStatus, String comment) {
        eventPublisher.publishEvent(new ReportStatusEvent(
                report.getId(), report.getNumber(),
                report.getRecycler() != null ? report.getRecycler().getId() : null,
                oldStatus, newStatus, comment,
                report.getRecycler() != null ? report.getRecycler().getCompanyName() : null,
                report.getSubmitterInn()));
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        try {
            return new BigDecimal(value.replace(",", ".").trim());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private ReportResponse toResponse(Report report) {
        List<ReportResponse.ReportItemResponse> items = report.getItems().stream()
                .map(this::toItemResponse)
                .toList();
        return ReportResponse.builder()
                .id(report.getId())
                .number(report.getNumber())
                .period(report.getPeriod())
                .status(report.getStatus().name().toLowerCase())
                .submitterInn(report.getSubmitterInn())
                .recyclerName(report.getRecycler() != null ? report.getRecycler().getCompanyName() : null)
                .recyclerId(report.getRecycler() != null ? report.getRecycler().getId() : null)
                .submittedAt(report.getSubmittedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .items(items)
                .build();
    }

    private ReportResponse.ReportItemResponse toItemResponse(ReportItem item) {
        return ReportResponse.ReportItemResponse.builder()
                .id(item.getId())
                .wasteGroup(item.getWasteGroup())
                .wasteCode(item.getWasteCode())
                .volumeReceived(item.getVolumeReceived())
                .volumeProcessed(item.getVolumeProcessed())
                .recyclingPercent(item.getRecyclingPercent())
                .recyclingNorm(item.getRecyclingNorm())
                .technology(item.getTechnology())
                .build();
    }
}
