package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.CalculationMapper;
import kg.eco.operator.dto.request.CalculationCreateRequest;
import kg.eco.operator.dto.request.ProductItemRequest;
import kg.eco.operator.dto.request.ReviewRequest;
import kg.eco.operator.dto.response.CalculationResponse;
import kg.eco.operator.dto.response.PenaltyResponse;
import kg.eco.operator.entity.*;
import kg.eco.operator.entity.enums.CalculationStatus;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.event.CalculationStatusEvent;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.integration.banking.BankingServicePort;
import kg.eco.operator.repository.*;
import kg.eco.operator.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CalculationServiceImplTest {

    @Mock private CalculationRepository calculationRepository;
    @Mock private UserRepository userRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private CalculationMapper calculationMapper;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private FileStorageService fileStorageService;
    @Mock private BankingServicePort bankingServicePort;

    @InjectMocks
    private CalculationServiceImpl calculationService;

    private User businessUser;
    private User operatorUser;
    private Company testCompany;
    private Calculation draftCalc;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(calculationService, "dailyRate", new BigDecimal("0.0009"));

        testCompany = new Company();
        testCompany.setId(1L);
        testCompany.setInn("02312200210134");
        testCompany.setCompanyName("ООО Тест");

        businessUser = new User();
        businessUser.setId(1L);
        businessUser.setInn("02312200210134");
        businessUser.setRole(RoleEnum.BUSINESS);
        businessUser.setCompany(testCompany);
        businessUser.setCompanyName("ООО Тест");

        operatorUser = new User();
        operatorUser.setId(2L);
        operatorUser.setInn("01234500010001");
        operatorUser.setRole(RoleEnum.ECO_OPERATOR);
        operatorUser.setCompanyName("Эко Оператор");

        draftCalc = new Calculation();
        draftCalc.setId(1L);
        draftCalc.setNumber("РС-2026-000001");
        draftCalc.setCompany(testCompany);
        draftCalc.setStatus(CalculationStatus.DRAFT);
        draftCalc.setTotalAmount(new BigDecimal("50000.00"));
        draftCalc.setItems(new ArrayList<>());
    }

    private void stubMapperResponse(Calculation calc) {
        CalculationResponse response = new CalculationResponse();
        response.setId(calc.getId());
        response.setNumber(calc.getNumber());
        response.setStatus(calc.getStatus().getValue());
        response.setTotalAmount(calc.getTotalAmount());
        when(calculationMapper.toResponse(calc)).thenReturn(response);
        when(calculationMapper.toDocumentResponseList(anyList())).thenReturn(List.of());
        lenient().when(documentRepository.findByEntityTypeAndEntityId(anyString(), any()))
                .thenReturn(List.of());
        lenient().when(paymentRepository.findAll()).thenReturn(List.of());
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("создаёт черновик расчёта")
        void create_success() {
            String inn = businessUser.getInn();
            CalculationCreateRequest request = new CalculationCreateRequest();
            request.setPeriod("2025");
            request.setQuarter("Q1");
            request.setDocumentType("ГТД");
            request.setDocumentNumber("ГТД-001");
            request.setDocumentDate(LocalDate.of(2025, 1, 15));
            request.setItems(List.of());

            when(userRepository.findByInn(inn)).thenReturn(Optional.of(businessUser));
            when(calculationRepository.count()).thenReturn(0L);
            when(calculationRepository.save(any(Calculation.class))).thenAnswer(inv -> {
                Calculation c = inv.getArgument(0);
                c.setId(1L);
                if (c.getItems() == null) c.setItems(new ArrayList<>());
                return c;
            });
            when(calculationMapper.toResponse(any())).thenReturn(new CalculationResponse());
            when(calculationMapper.toDocumentResponseList(anyList())).thenReturn(List.of());
            when(documentRepository.findByEntityTypeAndEntityId(anyString(), any())).thenReturn(List.of());
            when(paymentRepository.findAll()).thenReturn(List.of());

            CalculationResponse result = calculationService.create(inn, request);

            assertThat(result).isNotNull();
            verify(calculationRepository, atLeast(1)).save(any(Calculation.class));
        }

        @Test
        @DisplayName("пользователь без компании — ошибка")
        void create_noCompany_fails() {
            User noCompanyUser = new User();
            noCompanyUser.setInn("99999999999999");
            noCompanyUser.setCompany(null);
            when(userRepository.findByInn("99999999999999")).thenReturn(Optional.of(noCompanyUser));

            CalculationCreateRequest request = new CalculationCreateRequest();
            request.setItems(List.of());

            assertThatThrownBy(() -> calculationService.create("99999999999999", request))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("не привязан к компании");
        }
    }

    @Nested
    @DisplayName("submit")
    class SubmitTests {

        @Test
        @DisplayName("отправка черновика с позициями")
        void submit_success() {
            CalculationItem item = new CalculationItem();
            item.setAmount(new BigDecimal("1000"));
            draftCalc.setItems(List.of(item));

            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn(businessUser.getInn()))
                    .thenReturn(Optional.of(businessUser));
            when(calculationRepository.save(any(Calculation.class))).thenReturn(draftCalc);
            stubMapperResponse(draftCalc);

            calculationService.submit(1L, businessUser.getInn());

            assertThat(draftCalc.getStatus()).isEqualTo(CalculationStatus.SUBMITTED);
            assertThat(draftCalc.getSubmittedAt()).isNotNull();
            verify(eventPublisher).publishEvent(any(CalculationStatusEvent.class));
        }

        @Test
        @DisplayName("отправка пустого расчёта — ошибка")
        void submit_emptyItems_fails() {
            draftCalc.setItems(new ArrayList<>());
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn(businessUser.getInn()))
                    .thenReturn(Optional.of(businessUser));

            assertThatThrownBy(() -> calculationService.submit(1L, businessUser.getInn()))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("без позиций");
        }

        @Test
        @DisplayName("отправка одобренного расчёта — ошибка статуса")
        void submit_approvedCalc_fails() {
            draftCalc.setStatus(CalculationStatus.APPROVED);
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn(businessUser.getInn()))
                    .thenReturn(Optional.of(businessUser));

            assertThatThrownBy(() -> calculationService.submit(1L, businessUser.getInn()))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("статусе");
        }

        @Test
        @DisplayName("отправка чужого расчёта — ошибка доступа")
        void submit_notOwner_fails() {
            Company otherCompany = new Company();
            otherCompany.setId(999L);
            draftCalc.setCompany(otherCompany);
            draftCalc.setItems(List.of(new CalculationItem()));

            User otherUser = new User();
            otherUser.setInn("other-inn");
            otherUser.setCompany(testCompany); // company id=1, calc company id=999

            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn("other-inn")).thenReturn(Optional.of(otherUser));

            assertThatThrownBy(() -> calculationService.submit(1L, "other-inn"))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("доступа");
        }
    }

    @Nested
    @DisplayName("approve / reject")
    class ReviewTests {

        @Test
        @DisplayName("одобрение отправленного расчёта")
        void approve_success() {
            draftCalc.setStatus(CalculationStatus.SUBMITTED);
            ReviewRequest request = new ReviewRequest();
            request.setComment("Всё верно");

            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn(operatorUser.getInn()))
                    .thenReturn(Optional.of(operatorUser));
            when(calculationRepository.save(any(Calculation.class))).thenReturn(draftCalc);
            stubMapperResponse(draftCalc);

            calculationService.approve(1L, operatorUser.getInn(), request);

            assertThat(draftCalc.getStatus()).isEqualTo(CalculationStatus.APPROVED);
            assertThat(draftCalc.getReviewedBy()).isEqualTo("Эко Оператор");
            assertThat(draftCalc.getReviewedAt()).isNotNull();
        }

        @Test
        @DisplayName("отклонение с причиной")
        void reject_success() {
            draftCalc.setStatus(CalculationStatus.SUBMITTED);
            ReviewRequest request = new ReviewRequest();
            request.setComment("Неверный расчёт суммы");

            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn(operatorUser.getInn()))
                    .thenReturn(Optional.of(operatorUser));
            when(calculationRepository.save(any(Calculation.class))).thenReturn(draftCalc);
            stubMapperResponse(draftCalc);

            calculationService.reject(1L, operatorUser.getInn(), request);

            assertThat(draftCalc.getStatus()).isEqualTo(CalculationStatus.REJECTED);
            assertThat(draftCalc.getReviewComment()).isEqualTo("Неверный расчёт суммы");
        }

        @Test
        @DisplayName("отклонение без причины — ошибка")
        void reject_noCauseComment_fails() {
            draftCalc.setStatus(CalculationStatus.SUBMITTED);

            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));

            assertThatThrownBy(() -> calculationService.reject(1L, operatorUser.getInn(), null))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("Причина отклонения обязательна");
        }
    }

    @Nested
    @DisplayName("resubmit")
    class ResubmitTests {

        @Test
        @DisplayName("повторная отправка отклонённого расчёта")
        void resubmit_success() {
            draftCalc.setStatus(CalculationStatus.REJECTED);
            draftCalc.setReviewComment("Старый комментарий");
            draftCalc.setReviewedBy("Рецензент");
            draftCalc.setReviewedAt(LocalDateTime.now());

            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn(businessUser.getInn()))
                    .thenReturn(Optional.of(businessUser));
            when(calculationRepository.save(any(Calculation.class))).thenReturn(draftCalc);
            stubMapperResponse(draftCalc);

            calculationService.resubmit(1L, businessUser.getInn());

            assertThat(draftCalc.getStatus()).isEqualTo(CalculationStatus.SUBMITTED);
            assertThat(draftCalc.getReviewComment()).isNull();
            assertThat(draftCalc.getReviewedBy()).isNull();
            assertThat(draftCalc.getReviewedAt()).isNull();
        }
    }

    @Nested
    @DisplayName("deleteDraft")
    class DeleteDraftTests {

        @Test
        @DisplayName("удаление черновика")
        void deleteDraft_success() {
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn(businessUser.getInn()))
                    .thenReturn(Optional.of(businessUser));

            calculationService.deleteDraft(1L, businessUser.getInn());

            verify(calculationRepository).delete(draftCalc);
        }

        @Test
        @DisplayName("удаление не-черновика — ошибка")
        void deleteDraft_notDraft_fails() {
            draftCalc.setStatus(CalculationStatus.SUBMITTED);
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));
            when(userRepository.findByInn(businessUser.getInn()))
                    .thenReturn(Optional.of(businessUser));

            assertThatThrownBy(() -> calculationService.deleteDraft(1L, businessUser.getInn()))
                    .isInstanceOf(BusinessLogicException.class);
        }
    }

    @Nested
    @DisplayName("calculatePenalty")
    class PenaltyTests {

        @Test
        @DisplayName("нет пени, если дата оплаты ещё не наступила")
        void noPenalty_beforeDueDate() {
            draftCalc.setDueDate(LocalDate.now().plusDays(30));
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));

            PenaltyResponse result = calculationService.calculatePenalty(1L);

            assertThat(result.isOverdue()).isFalse();
            assertThat(result.getTotalPenalty()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("нет пени, если сумма нулевая")
        void noPenalty_zeroAmount() {
            draftCalc.setTotalAmount(BigDecimal.ZERO);
            draftCalc.setDueDate(LocalDate.now().minusDays(10));
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));

            PenaltyResponse result = calculationService.calculatePenalty(1L);

            assertThat(result.isOverdue()).isFalse();
        }

        @Test
        @DisplayName("нет пени, если dueDate = null")
        void noPenalty_noDueDate() {
            draftCalc.setDueDate(null);
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));

            PenaltyResponse result = calculationService.calculatePenalty(1L);

            assertThat(result.isOverdue()).isFalse();
        }

        @Test
        @DisplayName("динамическая пеня при просрочке")
        void dynamicPenalty_overdue() {
            draftCalc.setTotalAmount(new BigDecimal("100000.00"));
            draftCalc.setDueDate(LocalDate.now().minusDays(10));
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));

            PenaltyResponse result = calculationService.calculatePenalty(1L);

            assertThat(result.isOverdue()).isTrue();
            assertThat(result.getDaysOverdue()).isEqualTo(10);
            // dailyPenalty = 100000 * 0.0009 = 90.00
            assertThat(result.getDailyPenalty()).isEqualByComparingTo(new BigDecimal("90.00"));
            // totalPenalty = 90 * 10 = 900.00
            assertThat(result.getTotalPenalty()).isEqualByComparingTo(new BigDecimal("900.00"));
        }

        @Test
        @DisplayName("пеня ограничена 100% от суммы долга")
        void penalty_cappedAt100Percent() {
            draftCalc.setTotalAmount(new BigDecimal("1000.00"));
            // More than 1111 days would exceed 100% with 0.09% daily rate
            draftCalc.setDueDate(LocalDate.now().minusDays(2000));
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));

            PenaltyResponse result = calculationService.calculatePenalty(1L);

            assertThat(result.getTotalPenalty()).isEqualByComparingTo(new BigDecimal("1000.00"));
            assertThat(result.getProgressPercent()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("фиксированная пеня возвращает сохранённые значения")
        void fixedPenalty() {
            draftCalc.setTotalAmount(new BigDecimal("50000.00"));
            draftCalc.setDueDate(LocalDate.now().minusDays(30));
            draftCalc.setPenaltyFixedDate(LocalDate.now().minusDays(5));
            draftCalc.setPenaltyFixedAmount(new BigDecimal("1125.00"));
            draftCalc.setPenaltyFixedDays(25);
            when(calculationRepository.findById(1L)).thenReturn(Optional.of(draftCalc));

            PenaltyResponse result = calculationService.calculatePenalty(1L);

            assertThat(result.isOverdue()).isTrue();
            assertThat(result.getTotalPenalty()).isEqualByComparingTo(new BigDecimal("1125.00"));
            assertThat(result.getFixedDate()).isEqualTo(LocalDate.now().minusDays(5));
            assertThat(result.getFixedAmount()).isEqualByComparingTo(new BigDecimal("1125.00"));
        }
    }

    @Nested
    @DisplayName("getById")
    class GetByIdTests {

        @Test
        @DisplayName("расчёт не найден — ResourceNotFoundException")
        void getById_notFound() {
            when(calculationRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> calculationService.getById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
