package kg.eco.operator.service.impl;

import kg.eco.operator.dto.request.LoginRequest;
import kg.eco.operator.dto.request.RefreshTokenRequest;
import kg.eco.operator.dto.request.RegisterRequest;
import kg.eco.operator.dto.response.LoginResponse;
import kg.eco.operator.dto.response.UserProfileResponse;
import kg.eco.operator.entity.Account;
import kg.eco.operator.entity.Company;
import kg.eco.operator.entity.Payer;
import kg.eco.operator.entity.User;
import kg.eco.operator.entity.enums.PayerCategory;
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.entity.enums.ReportingStatus;
import kg.eco.operator.entity.enums.SettlementStatus;
import kg.eco.operator.entity.enums.SystemStatus;
import kg.eco.operator.entity.enums.PaymentStatus;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.exception.UnauthorizedException;
import kg.eco.operator.repository.AccountRepository;
import kg.eco.operator.repository.CompanyRepository;
import kg.eco.operator.repository.PayerRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.security.JwtTokenProvider;
import kg.eco.operator.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PayerRepository payerRepository;
    private final AccountRepository accountRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getInn(), request.getPassword())
        );

        User user = userRepository.findByInn(request.getInn())
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь", "ИНН", request.getInn()));

        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByInn(request.getInn())) {
            throw new BusinessLogicException("Пользователь с ИНН " + request.getInn() + " уже зарегистрирован");
        }

        // Create company
        Company company = new Company();
        company.setCompanyName(request.getCompanyName());
        company.setInn(request.getInn());
        company.setLegalForm(request.getLegalForm());
        company.setEmail(request.getEmail());
        company.setPhone(request.getPhone());
        company = companyRepository.save(company);

        // Create user
        User user = new User();
        user.setInn(request.getInn());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCompanyName(request.getCompanyName());
        user.setRole(RoleEnum.BUSINESS);
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setCompany(company);
        user = userRepository.save(user);

        // Create payer record
        Payer payer = new Payer();
        payer.setCompany(company);
        payer.setCategory(request.getCategory() != null ? request.getCategory() : PayerCategory.IMPORTER);
        payer.setRegistrationDate(LocalDate.now());
        payer.setReportingStatus(ReportingStatus.ACTIVE);
        payer.setSettlementStatus(SettlementStatus.SETTLED);
        payer.setSystemStatus(SystemStatus.ACTIVE);
        payer.setPaymentStatus(PaymentStatus.UNPAID);
        payerRepository.save(payer);

        // Create account
        Account account = new Account();
        account.setCompany(company);
        account.setBalance(BigDecimal.ZERO);
        account.setTotalCharged(BigDecimal.ZERO);
        account.setTotalPaid(BigDecimal.ZERO);
        account.setTotalOffset(BigDecimal.ZERO);
        accountRepository.save(account);

        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Невалидный refresh token");
        }

        if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Предоставленный токен не является refresh token");
        }

        String inn = jwtTokenProvider.getInnFromToken(refreshToken);
        User user = userRepository.findByInn(inn)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь", "ИНН", inn));

        return buildLoginResponse(user);
    }

    @Override
    public UserProfileResponse getCurrentUser(String inn) {
        User user = userRepository.findByInn(inn)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь", "ИНН", inn));
        return buildUserProfile(user);
    }

    private LoginResponse buildLoginResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getInn());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getInn());

        // Persist refresh token
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return LoginResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(buildUserProfile(user))
                .role(mapRoleToSwagger(user.getRole()))
                .expiresAt(jwtTokenProvider.getExpirationFromToken(accessToken))
                .build();
    }

    private UserProfileResponse buildUserProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .inn(user.getInn())
                .companyName(user.getCompanyName())
                .role(mapRoleToSwagger(user.getRole()))
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }

    /**
     * Maps internal RoleEnum to swagger UserRole format.
     * Swagger uses: business, eco-operator, ministry, admin, employee
     */
    private String mapRoleToSwagger(RoleEnum role) {
        return switch (role) {
            case BUSINESS -> "business";
            case ECO_OPERATOR -> "eco-operator";
            case MINISTRY -> "ministry";
            case ADMIN -> "admin";
            case EMPLOYEE -> "employee";
        };
    }
}
