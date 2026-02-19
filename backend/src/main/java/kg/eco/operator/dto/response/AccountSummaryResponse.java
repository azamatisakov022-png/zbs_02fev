package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountSummaryResponse {

    private long totalAccounts;
    private long accountsWithDebt;
    private long accountsWithPositiveBalance;
    private BigDecimal totalMonthlyIncome;
}
