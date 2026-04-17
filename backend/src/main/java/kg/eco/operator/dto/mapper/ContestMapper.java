package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.ContestResponse;
import kg.eco.operator.entity.Contest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContestMapper {

    @Mapping(source = "status", target = "status")
    @Mapping(source = "regulationsObjectKey", target = "hasRegulations", qualifiedByName = "objectKeyToBoolean")
    ContestResponse toResponse(Contest contest);

    List<ContestResponse> toResponseList(List<Contest> contests);

    @Named("objectKeyToBoolean")
    default Boolean objectKeyToBoolean(String objectKey) {
        return objectKey != null && !objectKey.isBlank();
    }

    default String mapEnum(Enum<?> value) {
        if (value == null) return null;
        try {
            return (String) value.getClass().getMethod("getValue").invoke(value);
        } catch (Exception e) {
            return value.name().toLowerCase();
        }
    }
}
