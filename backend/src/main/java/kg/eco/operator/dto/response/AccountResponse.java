package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AccountResponse {

    private Long id;
    private Long companyId;
    private String companyName;
    private String companyInn;
    private BigDecimal balance;
    private BigDecimal totalCharged;
    private BigDecimal totalPaid;
    private BigDecimal totalOffset;
    private List<AccountTransactionResponse> transactions;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastUpdated;
}
