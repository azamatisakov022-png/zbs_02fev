package kg.eco.operator.service.cabinet;

import kg.eco.operator.dto.response.BusinessDashboardResponse;
import kg.eco.operator.dto.response.DashboardResponse;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.service.AccountService;
import kg.eco.operator.service.DeclarationService;
import kg.eco.operator.service.PayerService;
import kg.eco.operator.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BusinessCabinetStrategy implements CabinetStrategy {

    private final PayerService payerService;
    private final AccountService accountService;
    private final DeclarationService declarationService;
    private final ReportService reportService;

    @Override
    public RoleEnum getRole() {
        return RoleEnum.BUSINESS;
    }

    @Override
    public DashboardResponse buildDashboard(User user) {
        String inn = user.getInn();

        return BusinessDashboardResponse.builder()
                .role(getRole().getValue())
                .userName(user.getCompanyName())
                .companyName(user.getCompanyName())
                .payer(payerService.getByInn(inn))
                .account(accountService.getAccountByInn(inn))
                .declarations(declarationService.getMyDeclarations(inn, 1, 5))
                .reports(reportService.getMyReports(inn, 1, 5))
                .build();
    }
}
