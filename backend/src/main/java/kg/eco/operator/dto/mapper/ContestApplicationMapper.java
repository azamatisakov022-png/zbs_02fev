package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.ContestApplicationResponse;
import kg.eco.operator.dto.response.ContestApplicationStatusResponse;
import kg.eco.operator.entity.ContestApplication;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContestApplicationMapper {

    @Mapping(source = "contest.id", target = "contestId")
    @Mapping(source = "contest.title", target = "contestTitle")
    @Mapping(source = ".", target = "fullName", qualifiedByName = "buildFullName")
    @Mapping(source = "reviewedBy.companyName", target = "reviewedBy")
    @Mapping(source = "status", target = "status")
    ContestApplicationResponse toResponse(ContestApplication application);

    List<ContestApplicationResponse> toResponseList(List<ContestApplication> applications);

    @Mapping(source = "contest.title", target = "contestTitle")
    @Mapping(source = "status", target = "status")
    ContestApplicationStatusResponse toStatusResponse(ContestApplication application);

    @Named("buildFullName")
    default String buildFullName(ContestApplication app) {
        if (app == null) return null;
        StringBuilder sb = new StringBuilder();
        if (app.getLastName() != null) sb.append(app.getLastName());
        if (app.getFirstName() != null) sb.append(' ').append(app.getFirstName());
        if (app.getMiddleName() != null && !app.getMiddleName().isBlank()) {
            sb.append(' ').append(app.getMiddleName());
        }
        return sb.toString().trim();
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
