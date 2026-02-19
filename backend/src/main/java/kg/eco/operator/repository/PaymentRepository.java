package kg.eco.operator.repository;

import kg.eco.operator.entity.Payment;
import kg.eco.operator.entity.enums.PaymentConfirmationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByCompany_Id(Long companyId, Pageable pageable);
    Page<Payment> findByStatus(PaymentConfirmationStatus status, Pageable pageable);
    Optional<Payment> findByPaymentNumber(String paymentNumber);
}
