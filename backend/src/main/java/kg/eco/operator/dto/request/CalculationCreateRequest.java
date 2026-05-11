package kg.eco.operator.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import kg.eco.operator.entity.enums.DocumentType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CalculationCreateRequest {

    @NotBlank(message = "Период обязателен")
    private String period;

    private String quarter;

    @NotNull(message = "Тип документа обязателен")
    private DocumentType documentType;

    @NotBlank(message = "Номер документа обязателен")
    private String documentNumber;

    @NotNull(message = "Дата документа обязательна")
    private LocalDate documentDate;

    @NotEmpty(message = "Необходимо указать хотя бы одну позицию")
    @Valid
    private List<ProductItemRequest> items;

    /**
     * Тип плательщика: "producer" (производитель) или "importer" (импортёр).
     * Используется бэкендом для вычисления dueDate (срока оплаты).
     */
    private String payerType;

    /**
     * Дата ввоза товаров на территорию КР (только для импортёров).
     * Срок оплаты = importDate + 15 рабочих дней (по ТЗ).
     */
    private LocalDate importDate;
}
