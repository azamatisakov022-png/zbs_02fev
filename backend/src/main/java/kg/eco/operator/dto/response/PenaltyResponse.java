package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PenaltyResponse {

    private BigDecimal debtAmount;

    @JsonFormat(pattern = "dd.MM.yyyy")
    private LocalDate dueDate;

    private long daysOverdue;

    private BigDecimal dailyRate;

    private BigDecimal dailyPenalty;

    private BigDecimal totalPenalty;

    private BigDecimal maxPenalty;

    private double progressPercent;

    private boolean overdue;

    @JsonFormat(pattern = "dd.MM.yyyy")
    private LocalDate fixedDate;

    private BigDecimal fixedAmount;

    /**
     * Factory for "no penalty" case (not overdue).
     */
    public static PenaltyResponse noPenalty(BigDecimal debtAmount, LocalDate dueDate) {
        return PenaltyResponse.builder()
                .debtAmount(debtAmount)
                .dueDate(dueDate)
                .daysOverdue(0)
                .dailyRate(BigDecimal.ZERO)
                .dailyPenalty(BigDecimal.ZERO)
                .totalPenalty(BigDecimal.ZERO)
                .maxPenalty(debtAmount)
                .progressPercent(0)
                .overdue(false)
                .build();
    }
}
