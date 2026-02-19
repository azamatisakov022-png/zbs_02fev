package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.*;
import kg.eco.operator.entity.*;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CalculationMapper {

    // ─── Calculation → Response ───

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.companyName", target = "companyName")
    @Mapping(source = "company.inn", target = "companyInn")
    @Mapping(source = "documentType", target = "documentType")
    @Mapping(source = "status", target = "status")
    CalculationResponse toResponse(Calculation calculation);

    List<CalculationResponse> toResponseList(List<Calculation> calculations);

    // ─── CalculationItem → ProductItemResponse ───

    ProductItemResponse toProductItemResponse(CalculationItem item);

    List<ProductItemResponse> toProductItemResponseList(List<CalculationItem> items);

    // ─── Payment → PaymentResponse ───

    @Mapping(source = "paymentMethod", target = "paymentMethod")
    @Mapping(source = "status", target = "status")
    PaymentResponse toPaymentResponse(Payment payment);

    // ─── Document → DocumentResponse ───

    @Mapping(source = "type", target = "type")
    DocumentResponse toDocumentResponse(Document document);

    List<DocumentResponse> toDocumentResponseList(List<Document> documents);

    // ─── Enum mapping helpers ───

    default String mapEnum(Enum<?> value) {
        return value != null ? value.name().toLowerCase() : null;
    }
}
