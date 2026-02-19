package kg.eco.operator.service;

import kg.eco.operator.dto.request.LoginRequest;
import kg.eco.operator.dto.request.RefreshTokenRequest;
import kg.eco.operator.dto.request.RegisterRequest;
import kg.eco.operator.dto.response.LoginResponse;
import kg.eco.operator.dto.response.UserProfileResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse register(RegisterRequest request);

    LoginResponse refresh(RefreshTokenRequest request);

    UserProfileResponse getCurrentUser(String inn);
}
