package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.PayerResponse;
import kg.eco.operator.entity.Payer;
import org.mapstruct.*;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PayerMapper {

    @Mapping(source = "company.companyName", target = "companyName")
    @Mapping(source = "company.inn", target = "inn")
    @Mapping(source = "company.legalForm", target = "legalForm")
    @Mapping(source = "company.region", target = "region")
    @Mapping(source = "company.address", target = "address")
    @Mapping(source = "company.director", target = "director")
    @Mapping(source = "company.contactPerson", target = "contactPerson")
    @Mapping(source = "company.phone", target = "phone")
    @Mapping(source = "company.email", target = "email")
    @Mapping(source = "category", target = "category")
    @Mapping(source = "subcategory", target = "subcategory")
    @Mapping(source = "reportingStatus", target = "reportingStatus")
    @Mapping(source = "settlementStatus", target = "settlementStatus")
    @Mapping(source = "systemStatus", target = "systemStatus")
    @Mapping(source = "paymentStatus", target = "paymentStatus")
    @Mapping(target = "productGroups", expression = "java(mapProductGroups(payer.getProductGroups()))")
    @Mapping(target = "declarations", ignore = true)
    @Mapping(target = "payments", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "auditLog", ignore = true)
    PayerResponse toResponse(Payer payer);

    List<PayerResponse> toResponseList(List<Payer> payers);

    default String mapEnum(Enum<?> value) {
        if (value == null) return null;
        try {
            return (String) value.getClass().getMethod("getValue").invoke(value);
        } catch (Exception e) {
            return value.name().toLowerCase();
        }
    }

    default List<String> mapProductGroups(String[] groups) {
        if (groups == null) return null;
        return Arrays.asList(groups);
    }
}
