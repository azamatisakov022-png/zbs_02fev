package kg.eco.operator.service;

import kg.eco.operator.dto.response.DashboardResponse;

public interface CabinetService {

    DashboardResponse getDashboard(String userInn);
}
