package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.AccountMapper;
import kg.eco.operator.dto.request.*;
import kg.eco.operator.dto.response.*;
import kg.eco.operator.entity.Account;
import kg.eco.operator.entity.Transaction;
import kg.eco.operator.entity.enums.ReferenceType;
import kg.eco.operator.entity.enums.TransactionType;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.repository.AccountRepository;
import kg.eco.operator.repository.TransactionRepository;
import kg.eco.operator.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AccountMapper accountMapper;

    @Override
    public List<AccountResponse> getAllAccounts(String search, Boolean hasDebt, Boolean hasPositiveBalance) {
        List<Account> accounts;

        if (search != null && !search.isBlank()) {
            accounts = accountRepository.searchAccounts(search.trim());
        } else if (Boolean.TRUE.equals(hasDebt)) {
            accounts = accountRepository.findAccountsWithDebt();
        } else if (Boolean.TRUE.equals(hasPositiveBalance)) {
            accounts = accountRepository.findAccountsWithPositiveBalance();
        } else {
            accounts = accountRepository.findAllWithCompany();
        }

        return accounts.stream()
                .map(accountMapper::toResponseWithoutTransactions)
                .toList();
    }

    @Override
    public AccountResponse getAccountByInn(String inn) {
        Account account = accountRepository.findByCompanyInn(inn)
                .orElseThrow(() -> new ResourceNotFoundException("Лицевой счёт для ИНН " + inn + " не найден"));
        return accountMapper.toResponse(account);
    }

    @Override
    public AccountResponse getAccountByCompanyId(Long companyId) {
        Account account = findAccountByCompanyId(companyId);
        return accountMapper.toResponse(account);
    }

    @Override
    public List<AccountTransactionResponse> getTransactions(Long companyId, String periodFrom, String periodTo) {
        Account account = findAccountByCompanyId(companyId);
        List<Transaction> transactions;

        if (periodFrom != null && periodTo != null) {
            LocalDate from = LocalDate.parse(periodFrom);
            LocalDate to = LocalDate.parse(periodTo);
            transactions = transactionRepository.findByAccount_IdAndDateBetweenOrderByDateDesc(
                    account.getId(), from, to);
        } else {
            transactions = transactionRepository.findByAccount_IdOrderByDateDesc(account.getId());
        }

        return accountMapper.toTransactionResponseList(transactions);
    }

    @Override
    @Transactional
    public void addCharge(Long companyId, ChargeRequest request) {
        Account account = findAccountByCompanyId(companyId);

        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setDate(LocalDate.now());
        tx.setType(TransactionType.CHARGE);
        tx.setDescription(request.getDescription() != null ? request.getDescription()
                : "Начисление по расчёту #" + request.getCalculationId());
        tx.setDebit(request.getAmount());
        tx.setCredit(BigDecimal.ZERO);
        tx.setReferenceId(request.getCalculationId());
        tx.setReferenceType(ReferenceType.CALCULATION);

        // Update account balance (debit increases debt = decreases balance)
        account.setBalance(account.getBalance().subtract(request.getAmount()));
        account.setTotalCharged(account.getTotalCharged().add(request.getAmount()));

        // Set running balance on transaction
        tx.setBalance(account.getBalance());

        transactionRepository.save(tx);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void addPayment(Long companyId, AccountPaymentRequest request) {
        Account account = findAccountByCompanyId(companyId);

        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        tx.setType(TransactionType.PAYMENT);
        tx.setDescription("Оплата" + (request.getDocumentNumber() != null
                ? " по документу " + request.getDocumentNumber() : ""));
        tx.setDebit(BigDecimal.ZERO);
        tx.setCredit(request.getAmount());
        tx.setReferenceType(ReferenceType.PAYMENT);

        // Update account balance (credit increases balance)
        account.setBalance(account.getBalance().add(request.getAmount()));
        account.setTotalPaid(account.getTotalPaid().add(request.getAmount()));

        tx.setBalance(account.getBalance());

        transactionRepository.save(tx);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void addOffset(Long companyId, OffsetRequest request) {
        Account account = findAccountByCompanyId(companyId);

        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setDate(LocalDate.now());
        tx.setType(TransactionType.OFFSET);
        tx.setDescription("Зачёт через переработку по отчёту #" + request.getReportId());
        tx.setDebit(BigDecimal.ZERO);
        tx.setCredit(request.getAmount());
        tx.setReferenceId(request.getReportId());
        tx.setReferenceType(ReferenceType.REPORT);

        account.setBalance(account.getBalance().add(request.getAmount()));
        account.setTotalOffset(account.getTotalOffset().add(request.getAmount()));

        tx.setBalance(account.getBalance());

        transactionRepository.save(tx);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void requestRefund(Long companyId, AccountRefundRequest request) {
        Account account = findAccountByCompanyId(companyId);

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessLogicException("Недостаточно средств для возврата");
        }

        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setDate(LocalDate.now());
        tx.setType(TransactionType.REFUND);
        tx.setDescription("Возврат: " + request.getReason());
        tx.setDebit(request.getAmount());
        tx.setCredit(BigDecimal.ZERO);
        tx.setReferenceType(ReferenceType.REFUND);

        account.setBalance(account.getBalance().subtract(request.getAmount()));

        tx.setBalance(account.getBalance());

        transactionRepository.save(tx);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void addCorrection(Long companyId, CorrectionCreateRequest request) {
        Account account = findAccountByCompanyId(companyId);

        if (request.getItems() != null) {
            for (CorrectionCreateRequest.CorrectionItemRequest item : request.getItems()) {
                BigDecimal diff = item.getCorrectedAmount().subtract(item.getOriginalAmount());

                Transaction tx = new Transaction();
                tx.setAccount(account);
                tx.setDate(LocalDate.now());
                tx.setType(TransactionType.CORRECTION);
                tx.setDescription((request.getComment() != null ? request.getComment() + ". " : "")
                        + "Корректировка расчёта #" + item.getCalculationId()
                        + ": " + item.getReason());
                tx.setReferenceId(item.getCalculationId());
                tx.setReferenceType(ReferenceType.CORRECTION);

                if (diff.compareTo(BigDecimal.ZERO) > 0) {
                    tx.setDebit(diff);
                    tx.setCredit(BigDecimal.ZERO);
                    account.setBalance(account.getBalance().subtract(diff));
                    account.setTotalCharged(account.getTotalCharged().add(diff));
                } else {
                    tx.setDebit(BigDecimal.ZERO);
                    tx.setCredit(diff.abs());
                    account.setBalance(account.getBalance().add(diff.abs()));
                    account.setTotalCharged(account.getTotalCharged().subtract(diff.abs()));
                }

                tx.setBalance(account.getBalance());
                transactionRepository.save(tx);
            }
        }

        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void submitCorrection(Long id) {
        // Correction workflow — placeholder for status management
        // In a full implementation, this would use a CorrectionRequest entity
    }

    @Override
    @Transactional
    public void approveCorrection(Long id) {
        // Correction workflow — placeholder for status management
    }

    @Override
    @Transactional
    public void rejectCorrection(Long id, CorrectionRejectRequest request) {
        // Correction workflow — placeholder for status management
    }

    @Override
    public CountResponse getCorrectionsPendingCount() {
        // Placeholder — returns 0 until CorrectionRequest entity is implemented
        return new CountResponse(0);
    }

    @Override
    public ReconciliationResponse getReconciliation(Long companyId, Long calculationId) {
        Account account = findAccountByCompanyId(companyId);

        BigDecimal charged = transactionRepository.sumChargedForReference(
                account.getId(), calculationId, ReferenceType.CALCULATION);
        BigDecimal paid = transactionRepository.sumPaidForReference(
                account.getId(), calculationId, ReferenceType.CALCULATION);
        BigDecimal offset = transactionRepository.sumOffsetForReference(
                account.getId(), calculationId, ReferenceType.CALCULATION);

        return ReconciliationResponse.builder()
                .charged(charged)
                .paid(paid)
                .offset(offset)
                .balance(charged.subtract(paid).subtract(offset))
                .build();
    }

    @Override
    public AccountSummaryResponse getSummary() {
        long totalAccounts = accountRepository.count();
        long accountsWithDebt = accountRepository.countWithDebt();
        long accountsWithPositiveBalance = accountRepository.countWithPositiveBalance();
        BigDecimal totalMonthlyIncome = accountRepository.sumTotalPaid();

        return AccountSummaryResponse.builder()
                .totalAccounts(totalAccounts)
                .accountsWithDebt(accountsWithDebt)
                .accountsWithPositiveBalance(accountsWithPositiveBalance)
                .totalMonthlyIncome(totalMonthlyIncome)
                .build();
    }

    // ─── Helper ───

    private Account findAccountByCompanyId(Long companyId) {
        return accountRepository.findByCompany_Id(companyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Лицевой счёт для компании " + companyId + " не найден"));
    }
}
