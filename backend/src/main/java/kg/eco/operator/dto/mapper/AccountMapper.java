package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.AccountResponse;
import kg.eco.operator.dto.response.AccountTransactionResponse;
import kg.eco.operator.entity.Account;
import kg.eco.operator.entity.Transaction;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    @Named("full")
    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.companyName", target = "companyName")
    @Mapping(source = "company.inn", target = "companyInn")
    AccountResponse toResponse(Account account);

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.companyName", target = "companyName")
    @Mapping(source = "company.inn", target = "companyInn")
    @Mapping(target = "transactions", ignore = true)
    AccountResponse toResponseWithoutTransactions(Account account);

    @IterableMapping(qualifiedByName = "full")
    List<AccountResponse> toResponseList(List<Account> accounts);

    @Mapping(source = "type", target = "type")
    @Mapping(source = "referenceType", target = "referenceType")
    AccountTransactionResponse toTransactionResponse(Transaction transaction);

    List<AccountTransactionResponse> toTransactionResponseList(List<Transaction> transactions);

    default String mapEnum(Enum<?> value) {
        return value != null ? value.name().toLowerCase() : null;
    }
}
