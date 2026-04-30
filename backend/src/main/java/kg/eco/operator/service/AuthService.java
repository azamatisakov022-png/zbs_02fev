package kg.eco.operator.service;

import kg.eco.operator.dto.request.LoginRequest;
import kg.eco.operator.dto.request.RefreshTokenRequest;
import kg.eco.operator.dto.request.RegisterRequest;
import kg.eco.operator.dto.request.UpdateApplicantTypeRequest;
import kg.eco.operator.dto.response.LoginResponse;
import kg.eco.operator.dto.response.UserProfileResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse register(RegisterRequest request);

    LoginResponse refresh(RefreshTokenRequest request);

    UserProfileResponse getCurrentUser(String inn);

    /**
     * Смена подтипа заявителя на лицензию.
     * Доступно только для BUSINESS-пользователей с businessType ∈ {APPLICANT, BOTH}.
     */
    UserProfileResponse updateApplicantType(String inn, UpdateApplicantTypeRequest request);
}
