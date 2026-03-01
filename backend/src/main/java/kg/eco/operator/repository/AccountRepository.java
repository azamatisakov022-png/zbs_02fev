package kg.eco.operator.repository;

import jakarta.persistence.LockModeType;
import kg.eco.operator.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByCompany_Id(Long companyId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.company.id = :companyId")
    Optional<Account> findByCompanyIdForUpdate(@Param("companyId") Long companyId);

    @Query("SELECT a FROM Account a JOIN FETCH a.company WHERE a.company.inn = :inn")
    Optional<Account> findByCompanyInn(@Param("inn") String inn);

    @Query("SELECT a FROM Account a JOIN FETCH a.company WHERE a.balance < 0")
    List<Account> findAccountsWithDebt();

    @Query("SELECT a FROM Account a JOIN FETCH a.company WHERE a.balance > 0")
    List<Account> findAccountsWithPositiveBalance();

    @Query("SELECT a FROM Account a JOIN FETCH a.company")
    List<Account> findAllWithCompany();

    @Query("SELECT a FROM Account a JOIN FETCH a.company " +
           "WHERE LOWER(a.company.companyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR a.company.inn LIKE CONCAT('%', :search, '%')")
    List<Account> searchAccounts(@Param("search") String search);

    @Query("SELECT COUNT(a) FROM Account a WHERE a.balance < 0")
    long countWithDebt();

    @Query("SELECT COUNT(a) FROM Account a WHERE a.balance > 0")
    long countWithPositiveBalance();

    @Query("SELECT COALESCE(SUM(a.totalPaid), 0) FROM Account a")
    BigDecimal sumTotalPaid();

    @Query("SELECT COALESCE(SUM(a.totalCharged), 0) FROM Account a")
    BigDecimal sumTotalCharged();
}
