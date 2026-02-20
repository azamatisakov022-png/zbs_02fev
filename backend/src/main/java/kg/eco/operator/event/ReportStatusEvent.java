package kg.eco.operator.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportStatusEvent {

    private final Long reportId;
    private final String reportNumber;
    private final Long recyclerId;
    private final String oldStatus;
    private final String newStatus;
    private final String comment;
    private final String companyName;
}
