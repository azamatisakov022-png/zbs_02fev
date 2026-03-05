package kg.eco.operator.service.cabinet;

import kg.eco.operator.dto.response.DashboardResponse;
import kg.eco.operator.dto.response.EmployeeDashboardResponse;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.service.AccountService;
import kg.eco.operator.service.AnalyticsService;
import kg.eco.operator.service.PayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmployeeCabinetStrategy implements CabinetStrategy {

    private final AnalyticsService analyticsService;
    private final PayerService payerService;
    private final AccountService accountService;

    @Override
    public RoleEnum getRole() {
        return RoleEnum.EMPLOYEE;
    }

    @Override
    public DashboardResponse buildDashboard(User user) {
        return EmployeeDashboardResponse.builder()
                .role(getRole().getValue())
                .userName(user.getCompanyName())
                .companyName(user.getCompanyName())
                .analytics(analyticsService.getSummary(null, null, null))
                .payerStats(payerService.getStats())
                .accountSummary(accountService.getSummary())
                .pendingCorrections(accountService.getCorrectionsPendingCount().getCount())
                .build();
    }
}
