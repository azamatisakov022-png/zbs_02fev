package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.RecyclerCapacityResponse;
import kg.eco.operator.dto.response.RecyclerResponse;
import kg.eco.operator.entity.Recycler;
import kg.eco.operator.entity.RecyclerCapacity;
import org.mapstruct.*;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface RecyclerMapper {

    @Mapping(source = "status", target = "status")
    @Mapping(source = "inspectionStatus", target = "inspectionStatus")
    @Mapping(target = "technologies", expression = "java(mapStringArray(recycler.getTechnologies()))")
    @Mapping(target = "certifications", expression = "java(mapStringArray(recycler.getCertifications()))")
    @Mapping(target = "documents", ignore = true)
    RecyclerResponse toResponse(Recycler recycler);

    List<RecyclerResponse> toResponseList(List<Recycler> recyclers);

    RecyclerCapacityResponse toCapacityResponse(RecyclerCapacity capacity);

    List<RecyclerCapacityResponse> toCapacityResponseList(List<RecyclerCapacity> capacities);

    default String mapEnum(Enum<?> value) {
        return value != null ? value.name().toLowerCase() : null;
    }

    default List<String> mapStringArray(String[] arr) {
        if (arr == null) return null;
        return Arrays.asList(arr);
    }
}
