package kg.eco.operator.integration.banking;

import kg.eco.operator.integration.banking.dto.BankPaymentVerificationRequest;
import kg.eco.operator.integration.banking.dto.BankPaymentVerificationResponse;
import kg.eco.operator.integration.banking.dto.BankStatementRequest;
import kg.eco.operator.integration.banking.dto.BankStatementResponse;

/**
 * Port for integration with banking systems (РСК Банк, Нацбанк КР).
 * Provides payment verification and bank statement reconciliation.
 */
public interface BankingServicePort {

    /**
     * Verify whether a specific payment has been received in the target bank account.
     */
    BankPaymentVerificationResponse verifyPayment(BankPaymentVerificationRequest request);

    /**
     * Retrieve bank account statement for a given period for reconciliation.
     */
    BankStatementResponse getAccountStatement(BankStatementRequest request);

    /**
     * Check the status of a previously initiated payment verification.
     */
    BankPaymentVerificationResponse checkPaymentStatus(String trackingId);
}
