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
import kg.eco.operator.entity.enums.RoleEnum;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.exception.ResourceNotFoundException;
import kg.eco.operator.exception.UnauthorizedException;
import kg.eco.operator.integration.taxservice.TaxServicePort;
import kg.eco.operator.integration.taxservice.dto.TaxInnVerificationResponse;
import kg.eco.operator.repository.AccountRepository;
import kg.eco.operator.repository.CompanyRepository;
import kg.eco.operator.repository.PayerRepository;
import kg.eco.operator.repository.UserRepository;
import kg.eco.operator.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserRepository userRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private PayerRepository payerRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private TaxServicePort taxServicePort;

    @InjectMocks
    private AuthServiceImpl authService;

    private static final String TEST_INN = "02312200210134";
    private static final String TEST_PASSWORD = "test123";
    private static final String ACCESS_TOKEN = "access-token-xxx";
    private static final String REFRESH_TOKEN = "refresh-token-xxx";

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setInn(TEST_INN);
        testUser.setPassword("encoded-password");
        testUser.setCompanyName("ООО Тест");
        testUser.setRole(RoleEnum.BUSINESS);
        testUser.setEmail("test@example.com");
        testUser.setPhone("+996555000000");
    }

    @Nested
    @DisplayName("login")
    class LoginTests {

        @Test
        @DisplayName("успешный вход возвращает токены и профиль")
        void login_success() {
            LoginRequest request = new LoginRequest();
            request.setInn(TEST_INN);
            request.setPassword(TEST_PASSWORD);

            when(userRepository.findByInn(TEST_INN)).thenReturn(Optional.of(testUser));
            when(jwtTokenProvider.generateAccessToken(TEST_INN)).thenReturn(ACCESS_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(TEST_INN)).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationFromToken(ACCESS_TOKEN))
                    .thenReturn(LocalDateTime.now().plusHours(1));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            LoginResponse response = authService.login(request);

            assertThat(response.getToken()).isEqualTo(ACCESS_TOKEN);
            assertThat(response.getRefreshToken()).isEqualTo(REFRESH_TOKEN);
            assertThat(response.getUser().getInn()).isEqualTo(TEST_INN);
            assertThat(response.getRole()).isEqualTo("business");

            verify(authenticationManager).authenticate(
                    new UsernamePasswordAuthenticationToken(TEST_INN, TEST_PASSWORD));
        }

        @Test
        @DisplayName("неверный пароль — выбрасывает BadCredentialsException")
        void login_badCredentials() {
            LoginRequest request = new LoginRequest();
            request.setInn(TEST_INN);
            request.setPassword("wrong");

            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("пользователь не найден — выбрасывает ResourceNotFoundException")
        void login_userNotFound() {
            LoginRequest request = new LoginRequest();
            request.setInn(TEST_INN);
            request.setPassword(TEST_PASSWORD);

            when(userRepository.findByInn(TEST_INN)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("refresh token сохраняется в user при логине")
        void login_savesRefreshToken() {
            LoginRequest request = new LoginRequest();
            request.setInn(TEST_INN);
            request.setPassword(TEST_PASSWORD);

            when(userRepository.findByInn(TEST_INN)).thenReturn(Optional.of(testUser));
            when(jwtTokenProvider.generateAccessToken(anyString())).thenReturn(ACCESS_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationFromToken(anyString()))
                    .thenReturn(LocalDateTime.now().plusHours(1));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            authService.login(request);

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertThat(captor.getValue().getRefreshToken()).isEqualTo(REFRESH_TOKEN);
        }
    }

    @Nested
    @DisplayName("register")
    class RegisterTests {

        private RegisterRequest validRequest() {
            RegisterRequest req = new RegisterRequest();
            req.setInn(TEST_INN);
            req.setCompanyName("ООО Тест");
            req.setLegalForm("ОсОО");
            req.setEmail("test@example.com");
            req.setPhone("+996555000000");
            req.setPassword(TEST_PASSWORD);
            return req;
        }

        @Test
        @DisplayName("успешная регистрация создаёт company, user, payer, account")
        void register_success() {
            RegisterRequest request = validRequest();
            TaxInnVerificationResponse taxResponse = new TaxInnVerificationResponse();
            taxResponse.setValid(true);
            taxResponse.setOfficialName("ООО Тест Офиц");

            when(userRepository.existsByInn(TEST_INN)).thenReturn(false);
            when(taxServicePort.verifyInn(TEST_INN)).thenReturn(taxResponse);
            when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));
            when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn("encoded");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(1L);
                return u;
            });
            when(payerRepository.save(any(Payer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(anyString())).thenReturn(ACCESS_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationFromToken(anyString()))
                    .thenReturn(LocalDateTime.now().plusHours(1));

            LoginResponse response = authService.register(request);

            assertThat(response.getToken()).isEqualTo(ACCESS_TOKEN);
            verify(companyRepository).save(any(Company.class));
            verify(userRepository).save(any(User.class));
            verify(payerRepository).save(any(Payer.class));
            verify(accountRepository).save(any(Account.class));
        }

        @Test
        @DisplayName("дублирующий ИНН — выбрасывает BusinessLogicException")
        void register_duplicateInn() {
            RegisterRequest request = validRequest();
            when(userRepository.existsByInn(TEST_INN)).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("уже зарегистрирован");
        }

        @Test
        @DisplayName("невалидный ИНН по ГНС — выбрасывает BusinessLogicException")
        void register_invalidInn() {
            RegisterRequest request = validRequest();
            TaxInnVerificationResponse taxResponse = new TaxInnVerificationResponse();
            taxResponse.setValid(false);
            taxResponse.setErrorMessage("ИНН не найден");

            when(userRepository.existsByInn(TEST_INN)).thenReturn(false);
            when(taxServicePort.verifyInn(TEST_INN)).thenReturn(taxResponse);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BusinessLogicException.class)
                    .hasMessageContaining("не найден в реестре ГНС");
        }

        @Test
        @DisplayName("если companyName не указан — используется officialName из ГНС")
        void register_usesOfficialNameIfNotProvided() {
            RegisterRequest request = validRequest();
            request.setCompanyName(null);

            TaxInnVerificationResponse taxResponse = new TaxInnVerificationResponse();
            taxResponse.setValid(true);
            taxResponse.setOfficialName("Официальное Имя ГНС");

            when(userRepository.existsByInn(TEST_INN)).thenReturn(false);
            when(taxServicePort.verifyInn(TEST_INN)).thenReturn(taxResponse);
            when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(1L);
                return u;
            });
            when(payerRepository.save(any(Payer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(anyString())).thenReturn(ACCESS_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationFromToken(anyString()))
                    .thenReturn(LocalDateTime.now().plusHours(1));

            authService.register(request);

            ArgumentCaptor<Company> captor = ArgumentCaptor.forClass(Company.class);
            verify(companyRepository).save(captor.capture());
            assertThat(captor.getValue().getCompanyName()).isEqualTo("Официальное Имя ГНС");
        }
    }

    @Nested
    @DisplayName("refresh")
    class RefreshTests {

        @Test
        @DisplayName("валидный refresh token — возвращает новые токены")
        void refresh_success() {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken(REFRESH_TOKEN);

            when(jwtTokenProvider.validateToken(REFRESH_TOKEN)).thenReturn(true);
            when(jwtTokenProvider.isRefreshToken(REFRESH_TOKEN)).thenReturn(true);
            when(jwtTokenProvider.getInnFromToken(REFRESH_TOKEN)).thenReturn(TEST_INN);
            when(userRepository.findByInn(TEST_INN)).thenReturn(Optional.of(testUser));
            when(jwtTokenProvider.generateAccessToken(TEST_INN)).thenReturn("new-access");
            when(jwtTokenProvider.generateRefreshToken(TEST_INN)).thenReturn("new-refresh");
            when(jwtTokenProvider.getExpirationFromToken("new-access"))
                    .thenReturn(LocalDateTime.now().plusHours(1));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            LoginResponse response = authService.refresh(request);

            assertThat(response.getToken()).isEqualTo("new-access");
            assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
        }

        @Test
        @DisplayName("невалидный токен — UnauthorizedException")
        void refresh_invalidToken() {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("bad-token");

            when(jwtTokenProvider.validateToken("bad-token")).thenReturn(false);

            assertThatThrownBy(() -> authService.refresh(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Невалидный");
        }

        @Test
        @DisplayName("access token вместо refresh — UnauthorizedException")
        void refresh_notRefreshToken() {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken(ACCESS_TOKEN);

            when(jwtTokenProvider.validateToken(ACCESS_TOKEN)).thenReturn(true);
            when(jwtTokenProvider.isRefreshToken(ACCESS_TOKEN)).thenReturn(false);

            assertThatThrownBy(() -> authService.refresh(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("не является refresh");
        }
    }

    @Nested
    @DisplayName("getCurrentUser")
    class GetCurrentUserTests {

        @Test
        @DisplayName("возвращает профиль по ИНН")
        void getCurrentUser_success() {
            when(userRepository.findByInn(TEST_INN)).thenReturn(Optional.of(testUser));

            UserProfileResponse profile = authService.getCurrentUser(TEST_INN);

            assertThat(profile.getInn()).isEqualTo(TEST_INN);
            assertThat(profile.getRole()).isEqualTo("business");
            assertThat(profile.getCompanyName()).isEqualTo("ООО Тест");
        }

        @Test
        @DisplayName("ИНН не найден — ResourceNotFoundException")
        void getCurrentUser_notFound() {
            when(userRepository.findByInn("99999")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getCurrentUser("99999"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
