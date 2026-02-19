package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.LoginRequest;
import kg.eco.operator.dto.request.RefreshTokenRequest;
import kg.eco.operator.dto.request.RegisterRequest;
import kg.eco.operator.dto.response.LoginResponse;
import kg.eco.operator.dto.response.UserProfileResponse;
import kg.eco.operator.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /auth/login — Вход в систему
     * security: [] (публичный)
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * POST /auth/register — Регистрация плательщика
     * security: [] (публичный)
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    /**
     * POST /auth/refresh — Обновление JWT токена
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    /**
     * GET /auth/me — Текущий профиль пользователя
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }
}
