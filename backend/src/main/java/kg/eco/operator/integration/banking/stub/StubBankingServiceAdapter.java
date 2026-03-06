package kg.eco.operator.integration.banking.stub;

import kg.eco.operator.integration.banking.BankingServicePort;
import kg.eco.operator.integration.banking.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Stub implementation of banking integration for dev/staging/demo.
 */
@Slf4j
@Service
@Profile("!production")
public class StubBankingServiceAdapter implements BankingServicePort {

    @Override
    public BankPaymentVerificationResponse verifyPayment(BankPaymentVerificationRequest request) {
        log.info("[STUB БАНК] Проверка платежа: номер={}, сумма={}, ИНН={}",
                request.getPaymentOrderNumber(), request.getExpectedAmount(), request.getPayerInn());

        // Simulate: amounts > 10,000 are always confirmed
        if (request.getExpectedAmount().compareTo(new BigDecimal("10000")) >= 0) {
            return BankPaymentVerificationResponse.builder()
                    .status(BankPaymentVerificationResponse.PaymentVerificationStatus.CONFIRMED)
                    .trackingId("TRK-" + UUID.randomUUID().toString().substring(0, 8))
                    .confirmedAmount(request.getExpectedAmount())
                    .confirmedDate(request.getPaymentDate())
                    .bankReference("RSK-" + System.currentTimeMillis())
                    .build();
        }

        // Small amounts — PENDING for demo
        return BankPaymentVerificationResponse.builder()
                .status(BankPaymentVerificationResponse.PaymentVerificationStatus.PENDING)
                .trackingId("TRK-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
    }

    @Override
    public BankStatementResponse getAccountStatement(BankStatementRequest request) {
        log.info("[STUB БАНК] Запрос выписки: счёт={}, период {}-{}",
                request.getAccountNumber(), request.getPeriodFrom(), request.getPeriodTo());

        List<BankStatementEntry> entries = new ArrayList<>();
        LocalDate date = request.getPeriodFrom();
        int counter = 1;
        while (!date.isAfter(request.getPeriodTo()) && counter <= 5) {
            entries.add(BankStatementEntry.builder()
                    .transactionId("TXN-" + counter)
                    .date(date)
                    .amount(new BigDecimal(50000 * counter))
                    .senderInn("0231220021013" + counter)
                    .senderName("ОсОО «Компания-" + counter + "»")
                    .senderBank("РСК Банк")
                    .purpose("Утилизационный сбор за " + date.getYear() + " г.")
                    .reference("REF-" + counter)
                    .build());
            date = date.plusDays(7);
            counter++;
        }

        return BankStatementResponse.builder()
                .accountNumber(request.getAccountNumber())
                .periodFrom(request.getPeriodFrom())
                .periodTo(request.getPeriodTo())
                .openingBalance(new BigDecimal("5000000"))
                .closingBalance(new BigDecimal("5750000"))
                .entries(entries)
                .build();
    }

    @Override
    public BankPaymentVerificationResponse checkPaymentStatus(String trackingId) {
        log.info("[STUB БАНК] Проверка статуса платежа: {}", trackingId);
        return BankPaymentVerificationResponse.builder()
                .status(BankPaymentVerificationResponse.PaymentVerificationStatus.CONFIRMED)
                .trackingId(trackingId)
                .confirmedAmount(new BigDecimal("100000"))
                .confirmedDate(LocalDate.now())
                .bankReference("RSK-CONFIRMED-" + System.currentTimeMillis())
                .build();
    }
}
