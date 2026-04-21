package kg.eco.operator.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import kg.eco.operator.dto.request.ManualPaymentRequest;
import kg.eco.operator.dto.response.PaymentIntentResponse;
import kg.eco.operator.dto.response.PaymentStatusResponse;
import kg.eco.operator.service.LicensePaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Эндпоинты оплаты госпошлины за лицензию.
 *   /license-applications/{id}/pay                      — инициация онлайн-оплаты (BUSINESS)
 *   /license-applications/{id}/manual-payment           — загрузка офлайн-квитанции (BUSINESS)
 *   /license-applications/{id}/payment-status           — polling статуса (BUSINESS)
 *   /admin/license-payments/{id}/confirm-manual         — подтверждение офлайн сотрудником
 *   /public/license-payments/webhook/{provider}         — публичный webhook от провайдера
 *
 * Webhook путь идёт через /public/** для обхода JWT-авторизации
 * (у провайдеров нет наших JWT).
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class LicensePaymentController {

    private final LicensePaymentService paymentService;

    // ─── Для заявителя ───

    @PostMapping("/license-applications/{id}/pay")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<PaymentIntentResponse> createIntent(
            @PathVariable Long id,
            @RequestBody(required = false) PayRequest request,
            Authentication auth) {
        String returnUrl = request != null ? request.getReturnUrl() : null;
        return ResponseEntity.ok(paymentService.createOnlineIntent(id, auth.getName(), returnUrl));
    }

    @PostMapping(value = "/license-applications/{id}/manual-payment", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<Void> submitOffline(
            @PathVariable Long id,
            @RequestPart("receipt") MultipartFile receipt,
            @Valid @RequestPart("info") ManualPaymentRequest info,
            Authentication auth) {
        paymentService.submitOfflineReceipt(id, auth.getName(), receipt, info);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/license-applications/{id}/payment-status")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<PaymentStatusResponse> status(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(paymentService.getStatus(id, auth.getName()));
    }

    // ─── Для сотрудника МПРЭТН ───

    @PostMapping("/admin/license-payments/{paymentId}/confirm-manual")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<Void> confirmManual(@PathVariable Long paymentId, Authentication auth) {
        paymentService.confirmManualPayment(paymentId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // ─── Публичный webhook ───

    @PostMapping("/public/license-payments/webhook/{provider}")
    public ResponseEntity<Void> webhook(
            @PathVariable String provider,
            @org.springframework.web.bind.annotation.RequestHeader(value = "X-Signature", required = false) String signature,
            HttpServletRequest httpRequest) throws IOException {
        String rawBody;
        try (BufferedReader r = httpRequest.getReader()) {
            rawBody = r.lines().collect(Collectors.joining("\n"));
        }
        log.info("Webhook received: provider={}, bodyLen={}", provider, rawBody.length());
        paymentService.handleWebhook(provider, rawBody, signature);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class PayRequest {
        private String returnUrl;
    }
}
