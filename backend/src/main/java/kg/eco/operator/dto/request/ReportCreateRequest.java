package kg.eco.operator.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ReportCreateRequest {

    @Size(max = 500)
    private String company;

    @Pattern(regexp = "\\d{14}", message = "ИНН должен содержать 14 цифр")
    private String inn;

    @NotBlank(message = "Год обязателен")
    @Pattern(regexp = "\\d{4}", message = "Год должен быть в формате YYYY")
    private String year;

    @NotEmpty(message = "Необходимо указать хотя бы одну позицию")
    @Valid
    private List<ReportItemRequest> items;

    @Data
    public static class ReportItemRequest {
        @NotBlank(message = "Тип отходов обязателен")
        private String wasteType;

        private String wasteCode;
        private String declared;
        private String processed;
        private String recycler;
        private String contractNumber;
        private String contractDate;
    }
}
