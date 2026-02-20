package kg.eco.operator.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {
    private String comment;
    private String reason;

    /**
     * Returns comment if set, otherwise falls back to reason.
     * Frontend sends { reason } for reject calls, backend uses getComment().
     */
    public String getComment() {
        return comment != null ? comment : reason;
    }
}
