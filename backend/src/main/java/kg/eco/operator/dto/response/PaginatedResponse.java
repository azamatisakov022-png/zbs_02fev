package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponse<T> {

    private List<T> data;
    private long total;
    private int page;
    private int pageSize;
    private int totalPages;

    public static <T> PaginatedResponse<T> of(Page<?> page, List<T> data) {
        return PaginatedResponse.<T>builder()
                .data(data)
                .total(page.getTotalElements())
                .page(page.getNumber() + 1)
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .build();
    }
}
