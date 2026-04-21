package kg.eco.operator.repository;

import kg.eco.operator.entity.LicensePaymentEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LicensePaymentEventRepository extends JpaRepository<LicensePaymentEvent, Long> {

    List<LicensePaymentEvent> findByPayment_IdOrderByReceivedAtAsc(Long paymentId);

    Page<LicensePaymentEvent> findByProviderOrderByReceivedAtDesc(String provider, Pageable pageable);
}
