package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.NotificationResponse;
import kg.eco.operator.entity.Notification;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "type", target = "type")
    @Mapping(target = "role", expression = "java(mapTargetRole(notification))")
    NotificationResponse toResponse(Notification notification);

    List<NotificationResponse> toResponseList(List<Notification> notifications);

    default String mapEnum(Enum<?> value) {
        if (value == null) return null;
        try {
            return (String) value.getClass().getMethod("getValue").invoke(value);
        } catch (Exception e) {
            return value.name().toLowerCase();
        }
    }

    default String mapTargetRole(Notification notification) {
        if (notification.getTargetRole() == null) return null;
        return mapEnum(notification.getTargetRole());
    }
}
