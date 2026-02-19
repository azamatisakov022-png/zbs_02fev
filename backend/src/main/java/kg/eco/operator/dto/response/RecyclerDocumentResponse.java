package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecyclerDocumentResponse {

    private Long id;
    private String name;
    private String type;
    private String url;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expiresAt;
}
