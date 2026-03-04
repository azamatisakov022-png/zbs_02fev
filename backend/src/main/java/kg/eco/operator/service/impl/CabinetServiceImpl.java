package kg.eco.operator.service.impl;

import kg.eco.operator.dto.response.DashboardResponse;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.service.CabinetService;
import kg.eco.operator.service.cabinet.CabinetStrategy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CabinetServiceImpl implements CabinetService {

    private final UserRepository userRepository;
    private final Map<RoleEnum, CabinetStrategy> strategies;

    public CabinetServiceImpl(UserRepository userRepository, List<CabinetStrategy> strategyList) {
        this.userRepository = userRepository;
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(CabinetStrategy::getRole, Function.identity()));
    }

    @Override
    public DashboardResponse getDashboard(String userInn) {
        User user = userRepository.findByInn(userInn)
                .orElseThrow(() -> new NoSuchElementException("Пользователь не найден: " + userInn));

        CabinetStrategy strategy = strategies.get(user.getRole());
        if (strategy == null) {
            throw new IllegalStateException("Нет стратегии для роли: " + user.getRole());
        }

        return strategy.buildDashboard(user);
    }
}
