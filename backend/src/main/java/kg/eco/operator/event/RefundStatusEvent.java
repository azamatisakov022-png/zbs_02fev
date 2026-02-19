package kg.eco.operator.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RefundStatusEvent {

    private final Long refundId;
    private final String refundNumber;
    private final Long userId;
    private final String oldStatus;
    private final String newStatus;
    private final String comment;
}
