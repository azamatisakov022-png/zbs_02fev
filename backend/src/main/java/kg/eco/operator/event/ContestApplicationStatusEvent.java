package kg.eco.operator.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContestApplicationStatusEvent {

    private final Long applicationId;
    private final String applicationNumber;
    private final Long contestId;
    private final String contestTitle;
    private final String oldStatus;
    private final String newStatus;
    private final String comment;
}
