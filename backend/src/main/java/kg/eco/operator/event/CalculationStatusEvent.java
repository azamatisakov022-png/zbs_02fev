package kg.eco.operator.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

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
}
