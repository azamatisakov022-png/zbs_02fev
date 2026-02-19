package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.CollectionPointResponse;
import kg.eco.operator.entity.CollectionPoint;
import org.mapstruct.*;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CollectionPointMapper {

    @Mapping(source = "status", target = "status")
    @Mapping(target = "wasteTypes", expression = "java(mapStringArray(collectionPoint.getWasteTypes()))")
    CollectionPointResponse toResponse(CollectionPoint collectionPoint);

    List<CollectionPointResponse> toResponseList(List<CollectionPoint> points);

    default String mapEnum(Enum<?> value) {
        return value != null ? value.name().toLowerCase() : null;
    }

    default List<String> mapStringArray(String[] arr) {
        if (arr == null) return null;
        return Arrays.asList(arr);
    }
}
