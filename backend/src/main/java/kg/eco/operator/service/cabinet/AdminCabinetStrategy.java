package kg.eco.operator.service.cabinet;

import kg.eco.operator.dto.response.AdminDashboardResponse;
import kg.eco.operator.dto.response.DashboardResponse;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.service.AdminService;
import kg.eco.operator.service.AnalyticsService;
import kg.eco.operator.service.PayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminCabinetStrategy implements CabinetStrategy {

    private final AnalyticsService analyticsService;
    private final PayerService payerService;
    private final AdminService adminService;

    @Override
    public RoleEnum getRole() {
        return RoleEnum.ADMIN;
    }

    @Override
    public DashboardResponse buildDashboard(User user) {
        return AdminDashboardResponse.builder()
                .role(getRole().getValue())
                .userName(user.getCompanyName())
                .companyName(user.getCompanyName())
                .analytics(analyticsService.getSummary(null, null, null))
                .payerStats(payerService.getStats())
                .totalUsers(adminService.getUsers().size())
                .build();
    }
}
