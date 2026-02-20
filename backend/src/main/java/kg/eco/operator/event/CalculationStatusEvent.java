package kg.eco.operator.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CalculationStatusEvent {

    private final Long calculationId;
    private final String calculationNumber;
    private final Long companyId;
    private final Long userId;
    private final String oldStatus;
    private final String newStatus;
    private final String reviewComment;
    private final String companyName;
    private final BigDecimal totalAmount;
}
