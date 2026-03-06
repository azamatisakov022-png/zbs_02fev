package kg.eco.operator.integration.customs.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CustomsDeclarationRequest {
    private String companyInn;
    private LocalDate periodFrom;
    private LocalDate periodTo;
    private String tnvedCodeFilter;
}
