package kg.eco.operator.repository;

import kg.eco.operator.entity.Transaction;
import kg.eco.operator.entity.enums.ReferenceType;
import kg.eco.operator.entity.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByAccount_Id(Long accountId, Pageable pageable);

    Page<Transaction> findByAccount_IdAndType(Long accountId, TransactionType type, Pageable pageable);

    List<Transaction> findByAccount_IdOrderByDateDesc(Long accountId);

    List<Transaction> findByAccount_IdAndDateBetweenOrderByDateDesc(
            Long accountId, LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(t.debit), 0) FROM Transaction t " +
           "WHERE t.account.id = :accountId AND t.referenceId = :referenceId " +
           "AND t.referenceType = :referenceType AND t.type = 'CHARGE'")
    BigDecimal sumChargedForReference(Long accountId, Long referenceId, ReferenceType referenceType);

    @Query("SELECT COALESCE(SUM(t.credit), 0) FROM Transaction t " +
           "WHERE t.account.id = :accountId AND t.referenceId = :referenceId " +
           "AND t.referenceType = :referenceType AND t.type = 'PAYMENT'")
    BigDecimal sumPaidForReference(Long accountId, Long referenceId, ReferenceType referenceType);

    @Query("SELECT COALESCE(SUM(t.credit), 0) FROM Transaction t " +
           "WHERE t.account.id = :accountId AND t.referenceId = :referenceId " +
           "AND t.referenceType = :referenceType AND t.type = 'OFFSET'")
    BigDecimal sumOffsetForReference(Long accountId, Long referenceId, ReferenceType referenceType);
}
