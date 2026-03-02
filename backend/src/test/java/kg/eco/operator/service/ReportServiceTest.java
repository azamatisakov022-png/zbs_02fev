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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock private ReportRepository reportRepository;
    @Mock private RecyclerRepository recyclerRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ReportService reportService;

    private Report testReport;
    private Recycler testRecycler;

    @BeforeEach
    void setUp() {
        testRecycler = new Recycler();
        testRecycler.setId(1L);
        testRecycler.setCompanyName("Рециклер-1");
        testRecycler.setInn("11111111111111");

        testReport = new Report();
        testReport.setId(1L);
        testReport.setNumber("РП-2026-001");
        testReport.setSubmitterInn("02312200210134");
        testReport.setPeriod("2025");
        testReport.setStatus(ReportStatus.DRAFT);
        testReport.setRecycler(testRecycler);
        testReport.setItems(new ArrayList<>());
        testReport.setCreatedAt(LocalDateTime.now());
        testReport.setUpdatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("getReports")
    class GetReportsTests {

        @Test
        @DisplayName("возвращает пагинированный список отчётов")
        void getReports_success() {
            Page<Report> page = new PageImpl<>(List.of(testReport), PageRequest.of(0, 10), 1);
            when(reportRepository.findAll(any(PageRequest.class))).thenReturn(page);

            PaginatedResponse<ReportResponse> result = reportService.getReports(1, 10);

            assertThat(result.getData()).hasSize(1);
            assertThat(result.getData().get(0).getNumber()).isEqualTo("РП-2026-001");
        }
    }

    @Nested
    @DisplayName("getMyReports")
    class GetMyReportsTests {

        @Test
        @DisplayName("возвращает отчёты конкретного пользователя")
        void getMyReports_success() {
            String inn = "02312200210134";
            Page<Report> page = new PageImpl<>(List.of(testReport), PageRequest.of(0, 10), 1);
            when(reportRepository.findBySubmitterInn(eq(inn), any(PageRequest.class))).thenReturn(page);

            PaginatedResponse<ReportResponse> result = reportService.getMyReports(inn, 1, 10);

            assertThat(result.getData()).hasSize(1);
            assertThat(result.getData().get(0).getSubmitterInn()).isEqualTo(inn);
        }
    }

    @Nested
    @DisplayName("getById")
    class GetByIdTests {

        @Test
        @DisplayName("находит отчёт по ID")
        void getById_success() {
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

            ReportResponse result = reportService.getById(1L);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getRecyclerName()).isEqualTo("Рециклер-1");
        }

        @Test
        @DisplayName("отчёт не найден — ResourceNotFoundException")
        void getById_notFound() {
            when(reportRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reportService.getById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("создаёт отчёт с позициями")
        void create_withItems() {
            String userInn = "02312200210134";
            ReportCreateRequest request = new ReportCreateRequest();
            request.setYear("2025");

            ReportCreateRequest.ReportItemRequest item = new ReportCreateRequest.ReportItemRequest();
            item.setWasteType("Пластик");
            item.setWasteCode("PET-01");
            item.setDeclared("100.5");
            item.setProcessed("80,3");
            request.setItems(List.of(item));

            when(recyclerRepository.findByInn(userInn)).thenReturn(Optional.of(testRecycler));
            when(reportRepository.count()).thenReturn(0L);
            when(reportRepository.save(any(Report.class))).thenAnswer(inv -> {
                Report r = inv.getArgument(0);
                r.setId(1L);
                if (r.getItems() == null) r.setItems(new ArrayList<>());
                return r;
            });

            ReportResponse result = reportService.create(userInn, request);

            assertThat(result).isNotNull();
            verify(reportRepository, atLeast(1)).save(any(Report.class));
        }

        @Test
        @DisplayName("создаёт отчёт без рециклера")
        void create_withoutRecycler() {
            String userInn = "02312200210134";
            ReportCreateRequest request = new ReportCreateRequest();
            request.setYear("2025");
            request.setItems(null);

            when(recyclerRepository.findByInn(userInn)).thenReturn(Optional.empty());
            when(reportRepository.count()).thenReturn(5L);
            when(reportRepository.save(any(Report.class))).thenAnswer(inv -> {
                Report r = inv.getArgument(0);
                r.setId(6L);
                if (r.getItems() == null) r.setItems(new ArrayList<>());
                return r;
            });

            ReportResponse result = reportService.create(userInn, request);

            assertThat(result).isNotNull();
            assertThat(result.getRecyclerName()).isNull();
        }
    }

    @Nested
    @DisplayName("submit")
    class SubmitTests {

        @Test
        @DisplayName("черновик можно отправить")
        void submit_fromDraft() {
            testReport.setStatus(ReportStatus.DRAFT);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));
            when(reportRepository.save(any(Report.class))).thenReturn(testReport);

            reportService.submit(1L);

            assertThat(testReport.getStatus()).isEqualTo(ReportStatus.SUBMITTED);
            assertThat(testReport.getSubmittedAt()).isNotNull();
            verify(eventPublisher).publishEvent(any(ReportStatusEvent.class));
        }

        @Test
        @DisplayName("отчёт на доработке можно отправить повторно")
        void submit_fromRevisionRequested() {
            testReport.setStatus(ReportStatus.REVISION_REQUESTED);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));
            when(reportRepository.save(any(Report.class))).thenReturn(testReport);

            reportService.submit(1L);

            assertThat(testReport.getStatus()).isEqualTo(ReportStatus.SUBMITTED);
        }

        @Test
        @DisplayName("одобренный отчёт нельзя отправить — BusinessLogicException")
        void submit_fromApproved_fails() {
            testReport.setStatus(ReportStatus.APPROVED);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

            assertThatThrownBy(() -> reportService.submit(1L))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("черновик");
        }
    }

    @Nested
    @DisplayName("approve")
    class ApproveTests {

        @Test
        @DisplayName("одобрение отправленного отчёта")
        void approve_success() {
            testReport.setStatus(ReportStatus.SUBMITTED);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));
            when(reportRepository.save(any(Report.class))).thenReturn(testReport);

            reportService.approve(1L, "Хороший отчёт");

            assertThat(testReport.getStatus()).isEqualTo(ReportStatus.APPROVED);
            verify(eventPublisher).publishEvent(any(ReportStatusEvent.class));
        }

        @Test
        @DisplayName("одобрение черновика — ошибка")
        void approve_draftFails() {
            testReport.setStatus(ReportStatus.DRAFT);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

            assertThatThrownBy(() -> reportService.approve(1L, "ок"))
                    .isInstanceOf(BusinessLogicException.class);
        }
    }

    @Nested
    @DisplayName("reject")
    class RejectTests {

        @Test
        @DisplayName("отклонение с причиной")
        void reject_success() {
            testReport.setStatus(ReportStatus.SUBMITTED);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));
            when(reportRepository.save(any(Report.class))).thenReturn(testReport);

            reportService.reject(1L, "Неполные данные");

            assertThat(testReport.getStatus()).isEqualTo(ReportStatus.REJECTED);

            ArgumentCaptor<ReportStatusEvent> captor = ArgumentCaptor.forClass(ReportStatusEvent.class);
            verify(eventPublisher).publishEvent(captor.capture());
        }

        @Test
        @DisplayName("отклонение без причины — ошибка")
        void reject_withoutReason_fails() {
            testReport.setStatus(ReportStatus.SUBMITTED);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

            assertThatThrownBy(() -> reportService.reject(1L, null))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("Причина отклонения обязательна");
        }

        @Test
        @DisplayName("отклонение с пустой причиной — ошибка")
        void reject_withBlankReason_fails() {
            testReport.setStatus(ReportStatus.SUBMITTED);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

            assertThatThrownBy(() -> reportService.reject(1L, "   "))
                    .isInstanceOf(BusinessLogicException.class);
        }
    }

    @Nested
    @DisplayName("returnForRevision")
    class ReturnForRevisionTests {

        @Test
        @DisplayName("возврат на доработку отправленного отчёта")
        void returnForRevision_success() {
            testReport.setStatus(ReportStatus.SUBMITTED);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));
            when(reportRepository.save(any(Report.class))).thenReturn(testReport);

            reportService.returnForRevision(1L, "Нужно уточнить объёмы");

            assertThat(testReport.getStatus()).isEqualTo(ReportStatus.REVISION_REQUESTED);
        }

        @Test
        @DisplayName("возврат черновика — ошибка")
        void returnForRevision_draftFails() {
            testReport.setStatus(ReportStatus.DRAFT);
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

            assertThatThrownBy(() -> reportService.returnForRevision(1L, "комментарий"))
                    .isInstanceOf(BusinessLogicException.class);
        }
    }

    @Nested
    @DisplayName("getPendingCount")
    class GetPendingCountTests {

        @Test
        @DisplayName("возвращает количество отчётов на рассмотрении")
        void getPendingCount_success() {
            Page<Report> page = new PageImpl<>(List.of(), PageRequest.of(0, 1), 5);
            when(reportRepository.findByStatus(eq(ReportStatus.SUBMITTED), any(PageRequest.class)))
                    .thenReturn(page);

            long count = reportService.getPendingCount();

            assertThat(count).isEqualTo(5);
        }
    }
}
