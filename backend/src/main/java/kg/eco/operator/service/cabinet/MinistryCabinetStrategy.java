package kg.eco.operator.service.cabinet;

import kg.eco.operator.dto.response.DashboardResponse;
import kg.eco.operator.dto.response.MinistryDashboardResponse;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MinistryCabinetStrategy implements CabinetStrategy {

    private final AnalyticsService analyticsService;

    @Override
    public RoleEnum getRole() {
        return RoleEnum.MINISTRY;
    }

    @Override
    public DashboardResponse buildDashboard(User user) {
        return MinistryDashboardResponse.builder()
                .role(getRole().getValue())
                .userName(user.getCompanyName())
                .companyName(user.getCompanyName())
                .analytics(analyticsService.getSummary(null, null, null))
                .regions(analyticsService.getRegions())
                .build();
    }
}
