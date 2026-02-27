package kg.eco.operator.service;

import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.DeclarationResponse;
import kg.eco.operator.dto.response.PaginatedResponse;
import kg.eco.operator.entity.Company;
import kg.eco.operator.entity.Declaration;
import kg.eco.operator.entity.DeclarationItem;
import kg.eco.operator.entity.enums.DeclarationStatus;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.CompanyRepository;
import kg.eco.operator.repository.DeclarationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeclarationService {

    private final DeclarationRepository declarationRepository;
    private final CompanyRepository companyRepository;

    public PaginatedResponse<DeclarationResponse> getDeclarations(int page, int pageSize,
                                                                    String search, String status, Integer year) {
        Page<Declaration> declPage = declarationRepository.findAll(
                PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<DeclarationResponse> data = declPage.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PaginatedResponse.of(declPage, data);
    }

    public PaginatedResponse<DeclarationResponse> getMyDeclarations(String userInn, int page, int pageSize) {
        Company company = companyRepository.findByInn(userInn).orElse(null);
        if (company == null) {
            return new PaginatedResponse<>(Collections.emptyList(), 0, page, pageSize, 0);
        }
        Page<Declaration> declPage = declarationRepository.findByCompany_Id(company.getId(),
                PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<DeclarationResponse> data = declPage.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PaginatedResponse.of(declPage, data);
    }

    public DeclarationResponse getById(Long id) {
        Declaration decl = declarationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Декларация с ID " + id + " не найдена"));
        return toResponse(decl);
    }

    @Transactional
    public DeclarationResponse create(String userInn, Integer year) {
        Company company = companyRepository.findByInn(userInn)
                .orElseThrow(() -> new ResourceNotFoundException("Компания не найдена для ИНН: " + userInn));

        long count = declarationRepository.count();
        String number = "ДЕК-" + LocalDateTime.now().getYear() + "-" + String.format("%06d", count + 1);

        Declaration decl = new Declaration();
        decl.setNumber(number);
        decl.setCompany(company);
        decl.setYear(year);
        decl.setStatus(DeclarationStatus.DRAFT);
        decl = declarationRepository.save(decl);
        return toResponse(decl);
    }

    @Transactional
    public DeclarationResponse submitDraft(Long id) {
        Declaration decl = findById(id);
        // Just save as draft — no status change
        decl = declarationRepository.save(decl);
        return toResponse(decl);
    }

    @Transactional
    public DeclarationResponse submit(Long id) {
        Declaration decl = findById(id);
        if (decl.getStatus() != DeclarationStatus.DRAFT && decl.getStatus() != DeclarationStatus.REVISION_REQUESTED) {
            throw new BusinessLogicException("Подать можно только черновик или декларацию на доработке");
        }
        decl.setStatus(DeclarationStatus.SUBMITTED);
        decl.setSubmittedAt(LocalDateTime.now());
        decl = declarationRepository.save(decl);
        return toResponse(decl);
    }

    @Transactional
    public DeclarationResponse approve(Long id, String comment) {
        Declaration decl = findById(id);
        if (decl.getStatus() != DeclarationStatus.SUBMITTED) {
            throw new BusinessLogicException("Одобрить можно только декларацию на рассмотрении");
        }
        decl.setStatus(DeclarationStatus.APPROVED);
        decl = declarationRepository.save(decl);
        return toResponse(decl);
    }

    @Transactional
    public DeclarationResponse reject(Long id, String comment) {
        Declaration decl = findById(id);
        if (decl.getStatus() != DeclarationStatus.SUBMITTED) {
            throw new BusinessLogicException("Отклонить можно только декларацию на рассмотрении");
        }
        if (comment == null || comment.isBlank()) {
            throw new BusinessLogicException("Причина отклонения обязательна");
        }
        decl.setStatus(DeclarationStatus.REJECTED);
        decl = declarationRepository.save(decl);
        return toResponse(decl);
    }

    @Transactional
    public DeclarationResponse returnForRevision(Long id, String comment) {
        Declaration decl = findById(id);
        if (decl.getStatus() != DeclarationStatus.SUBMITTED) {
            throw new BusinessLogicException("Вернуть на доработку можно только декларацию на рассмотрении");
        }
        decl.setStatus(DeclarationStatus.REVISION_REQUESTED);
        decl = declarationRepository.save(decl);
        return toResponse(decl);
    }

    @Transactional
    public DeclarationResponse resubmit(Long id) {
        Declaration decl = findById(id);
        if (decl.getStatus() != DeclarationStatus.REVISION_REQUESTED && decl.getStatus() != DeclarationStatus.REJECTED) {
            throw new BusinessLogicException("Повторно подать можно только декларацию на доработке или отклонённую");
        }
        decl.setStatus(DeclarationStatus.SUBMITTED);
        decl.setSubmittedAt(LocalDateTime.now());
        decl = declarationRepository.save(decl);
        return toResponse(decl);
    }

    public long getPendingCount() {
        return declarationRepository.findByStatus(DeclarationStatus.SUBMITTED, PageRequest.of(0, 1))
                .getTotalElements();
    }

    public List<DeclarationResponse> getByCompany(Long companyId) {
        Page<Declaration> declPage = declarationRepository.findByCompany_Id(companyId,
                PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "createdAt")));
        return declPage.getContent().stream()
                .map(this::toResponse)
                .toList();
    }

    private Declaration findById(Long id) {
        return declarationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Декларация с ID " + id + " не найдена"));
    }

    private DeclarationResponse toResponse(Declaration decl) {
        List<DeclarationResponse.DeclarationCalcItemResponse> calcItems = decl.getItems().stream()
                .map(item -> DeclarationResponse.DeclarationCalcItemResponse.builder()
                        .calculationId(item.getCalculation() != null ? item.getCalculation().getId() : null)
                        .number(item.getNumber())
                        .period(item.getPeriod())
                        .amount(item.getAmount())
                        .status(item.getStatus() != null ? item.getStatus().getValue() : null)
                        .build())
                .toList();

        DeclarationResponse.DeclarationPaymentResponse payment = DeclarationResponse.DeclarationPaymentResponse.builder()
                .totalCharged(decl.getTotalCharged())
                .totalPaid(decl.getTotalPaid())
                .totalOffset(decl.getTotalOffset())
                .balance(decl.getBalance())
                .build();

        return DeclarationResponse.builder()
                .id(decl.getId())
                .number(decl.getNumber())
                .companyId(decl.getCompany() != null ? decl.getCompany().getId() : null)
                .companyName(decl.getCompany() != null ? decl.getCompany().getCompanyName() : null)
                .companyInn(decl.getCompany() != null ? decl.getCompany().getInn() : null)
                .year(decl.getYear())
                .calculations(calcItems)
                .reports(Collections.emptyList())
                .payment(payment)
                .documents(Collections.emptyList())
                .history(Collections.emptyList())
                .status(decl.getStatus().getValue())
                .submittedAt(decl.getSubmittedAt())
                .createdAt(decl.getCreatedAt())
                .build();
    }
}
