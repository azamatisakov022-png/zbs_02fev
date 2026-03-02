package kg.eco.operator.integration.customs.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CustomsDeclarationResponse {
    private String declarationNumber;
    private LocalDate declarationDate;
    private String customsPost;
    private List<CustomsImportItem> items;
    private String countryOfOrigin;
}
