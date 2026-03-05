package kg.eco.operator.service.cabinet;

import kg.eco.operator.dto.response.DashboardResponse;
import kg.eco.operator.dto.response.GuestDashboardResponse;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.RoleEnum;
import org.springframework.stereotype.Component;

@Component
public class GuestCabinetStrategy implements CabinetStrategy {

    @Override
    public RoleEnum getRole() {
        return RoleEnum.GUEST;
    }

    @Override
    public DashboardResponse buildDashboard(User user) {
        return GuestDashboardResponse.builder()
                .role(getRole().getValue())
                .userName(user.getCompanyName())
                .companyName(user.getCompanyName())
                .message("Добро пожаловать! Для доступа к функциям системы обратитесь к администратору.")
                .build();
    }
}
