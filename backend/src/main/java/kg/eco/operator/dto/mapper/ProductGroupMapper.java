package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.*;
import kg.eco.operator.entity.*;
import kg.eco.operator.entity.enums.ProductGroupType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductGroupMapper {

    @Mapping(target = "type", source = "type", qualifiedByName = "mapType")
    @Mapping(target = "currentRate", ignore = true)
    @Mapping(target = "subgroupCount", ignore = true)
    ProductGroupSummaryResponse toSummary(ProductGroup productGroup);

    @Mapping(target = "type", source = "type", qualifiedByName = "mapType")
    @Mapping(target = "currentRate", ignore = true)
    @Mapping(target = "subgroups", ignore = true)
    @Mapping(target = "norms", ignore = true)
    @Mapping(target = "currentRateDetails", ignore = true)
    ProductGroupDetailResponse toDetail(ProductGroup productGroup);

    @Mapping(target = "type", source = "type", qualifiedByName = "mapType")
    ProductSubgroupResponse toSubgroupResponse(ProductSubgroup subgroup);

    List<ProductSubgroupResponse> toSubgroupResponseList(List<ProductSubgroup> subgroups);

    ProductGroupRateResponse toRateResponse(ProductGroupRate rate);

    ProductGroupNormResponse toNormResponse(ProductGroupNorm norm);

    List<ProductGroupNormResponse> toNormResponseList(List<ProductGroupNorm> norms);

    @Named("mapType")
    default String mapType(ProductGroupType type) {
        return type != null ? type.getValue() : null;
    }

    default ProductGroupSummaryResponse toSummaryWithRate(ProductGroup pg, BigDecimal currentRate) {
        return new ProductGroupSummaryResponse(
                pg.getId(),
                pg.getGroupNumber(),
                pg.getName(),
                pg.getCode(),
                mapType(pg.getType()),
                pg.getUnit(),
                pg.getSectionLetter(),
                pg.getSectionName(),
                currentRate,
                pg.getSubgroups() != null ? pg.getSubgroups().size() : 0
        );
    }

    default ProductGroupDetailResponse toDetailFull(
            ProductGroup pg,
            BigDecimal currentRate,
            List<ProductSubgroupResponse> subgroups,
            List<ProductGroupNormResponse> norms,
            ProductGroupRateResponse rateDetails
    ) {
        return new ProductGroupDetailResponse(
                pg.getId(),
                pg.getGroupNumber(),
                pg.getName(),
                pg.getCode(),
                mapType(pg.getType()),
                pg.getUnit(),
                pg.getSectionLetter(),
                pg.getSectionName(),
                currentRate,
                subgroups,
                norms,
                rateDetails
        );
    }
}
