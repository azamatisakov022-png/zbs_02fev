package kg.eco.operator.integration.taxservice;

import kg.eco.operator.integration.taxservice.dto.TaxCompanyRegistrationResponse;
import kg.eco.operator.integration.taxservice.dto.TaxInnVerificationResponse;
import kg.eco.operator.integration.taxservice.dto.TaxReportSubmissionRequest;
import kg.eco.operator.integration.taxservice.dto.TaxReportSubmissionResponse;

import java.util.List;

/**
 * Port for integration with ГНС КР (Государственная налоговая служба).
 * <p>
 * Provides INN verification, company registration data retrieval,
 * and utilization fee reporting to the tax authority.
 */
public interface TaxServicePort {

    /**
     * Verify that a company with the given INN exists in the ГНС КР registry.
     */
    TaxInnVerificationResponse verifyInn(String inn);

    /**
     * Retrieve full company registration data from ГНС КР by INN.
     */
    TaxCompanyRegistrationResponse getCompanyRegistration(String inn);

    /**
     * Submit utilization fee calculation data to ГНС КР for tax reporting.
     */
    TaxReportSubmissionResponse submitUtilizationFeeReport(TaxReportSubmissionRequest request);

    /**
     * Search companies by ОКЭД codes in ГНС КР registry.
     */
    List<TaxCompanyRegistrationResponse> getCompaniesByOkedCodes(List<String> okedCodes);
}
