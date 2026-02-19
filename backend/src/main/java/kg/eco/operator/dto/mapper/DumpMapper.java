package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.DumpResponse;
import kg.eco.operator.entity.Dump;
import org.mapstruct.*;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DumpMapper {

    @Mapping(source = "status", target = "status")
    @Mapping(target = "wasteTypes", expression = "java(mapStringArray(dump.getWasteTypes()))")
    @Mapping(target = "photos", expression = "java(mapStringArray(dump.getPhotos()))")
    DumpResponse toResponse(Dump dump);

    List<DumpResponse> toResponseList(List<Dump> dumps);

    default String mapEnum(Enum<?> value) {
        return value != null ? value.name().toLowerCase() : null;
    }

    default List<String> mapStringArray(String[] arr) {
        if (arr == null) return null;
        return Arrays.asList(arr);
    }
}
