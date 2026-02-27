package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.RefundItemResponse;
import kg.eco.operator.dto.response.RefundResponse;
import kg.eco.operator.entity.Refund;
import kg.eco.operator.entity.RefundItem;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RefundMapper {

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.companyName", target = "companyName")
    @Mapping(source = "status", target = "status")
    RefundResponse toResponse(Refund refund);

    List<RefundResponse> toResponseList(List<Refund> refunds);

    @Mapping(source = "calculation.id", target = "calculationId")
    @Mapping(source = "reason", target = "reason")
    RefundItemResponse toItemResponse(RefundItem item);

    List<RefundItemResponse> toItemResponseList(List<RefundItem> items);

    default String mapEnum(Enum<?> value) {
        if (value == null) return null;
        try {
            return (String) value.getClass().getMethod("getValue").invoke(value);
        } catch (Exception e) {
            return value.name().toLowerCase();
        }
    }
}
