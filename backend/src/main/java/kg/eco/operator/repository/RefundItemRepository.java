package kg.eco.operator.repository;

import kg.eco.operator.entity.RefundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundItemRepository extends JpaRepository<RefundItem, Long> {
    List<RefundItem> findByRefund_Id(Long refundId);
}
