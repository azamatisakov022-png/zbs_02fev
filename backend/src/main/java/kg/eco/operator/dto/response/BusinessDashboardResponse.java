package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BusinessDashboardResponse extends DashboardResponse {

    private PayerResponse payer;
    private AccountResponse account;
    private PaginatedResponse<DeclarationResponse> declarations;
    private PaginatedResponse<ReportResponse> reports;
}
