package kg.eco.operator.service.cabinet;

import kg.eco.operator.dto.response.DashboardResponse;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.RoleEnum;

public interface CabinetStrategy {

    RoleEnum getRole();

    DashboardResponse buildDashboard(User user);
}
