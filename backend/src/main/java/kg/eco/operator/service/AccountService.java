package kg.eco.operator.service;

import kg.eco.operator.dto.request.*;
import kg.eco.operator.dto.response.*;

import java.util.List;

public interface AccountService {

    List<AccountResponse> getAllAccounts(String search, Boolean hasDebt, Boolean hasPositiveBalance);

    AccountResponse getAccountByCompanyId(Long companyId);

    List<AccountTransactionResponse> getTransactions(Long companyId, String periodFrom, String periodTo);

    void addCharge(Long companyId, ChargeRequest request);

    void addPayment(Long companyId, AccountPaymentRequest request);

    void addOffset(Long companyId, OffsetRequest request);

    void requestRefund(Long companyId, AccountRefundRequest request);

    void addCorrection(Long companyId, CorrectionCreateRequest request);

    void submitCorrection(Long id);

    void approveCorrection(Long id);

    void rejectCorrection(Long id, CorrectionRejectRequest request);

    CountResponse getCorrectionsPendingCount();

    ReconciliationResponse getReconciliation(Long companyId, Long calculationId);

    AccountSummaryResponse getSummary();
}
