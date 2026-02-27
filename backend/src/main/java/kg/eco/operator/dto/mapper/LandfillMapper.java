package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.LandfillResponse;
import kg.eco.operator.entity.Landfill;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LandfillMapper {

    @Mapping(source = "type", target = "type")
    @Mapping(source = "status", target = "status")
    @Mapping(target = "wasteAcceptance", ignore = true)
    @Mapping(target = "infrastructure", expression = "java(mapInfrastructure(landfill))")
    @Mapping(target = "equipment", expression = "java(mapEquipment(landfill))")
    @Mapping(target = "morphology", expression = "java(mapMorphology(landfill))")
    LandfillResponse toResponse(Landfill landfill);

    List<LandfillResponse> toResponseList(List<Landfill> landfills);

    default String mapEnum(Enum<?> value) {
        if (value == null) return null;
        try {
            return (String) value.getClass().getMethod("getValue").invoke(value);
        } catch (Exception e) {
            return value.name().toLowerCase();
        }
    }

    default LandfillResponse.InfrastructureResponse mapInfrastructure(Landfill l) {
        return LandfillResponse.InfrastructureResponse.builder()
                .hasWeighStation(l.getHasWeighStation())
                .hasFencing(l.getHasFencing())
                .hasAccessRoad(l.getHasAccessRoad())
                .hasWaterMonitoring(l.getHasWaterMonitoring())
                .hasGasCollection(l.getHasGasCollection())
                .hasLeachateSystem(l.getHasLeachateSystem())
                .build();
    }

    default LandfillResponse.EquipmentResponse mapEquipment(Landfill l) {
        return LandfillResponse.EquipmentResponse.builder()
                .bulldozers(l.getBulldozers())
                .compactors(l.getCompactors())
                .excavators(l.getExcavators())
                .trucks(l.getTrucks())
                .build();
    }

    default LandfillResponse.MorphologyResponse mapMorphology(Landfill l) {
        return LandfillResponse.MorphologyResponse.builder()
                .organic(l.getMorphOrganic())
                .paper(l.getMorphPaper())
                .plastic(l.getMorphPlastic())
                .glass(l.getMorphGlass())
                .metal(l.getMorphMetal())
                .textile(l.getMorphTextile())
                .other(l.getMorphOther())
                .build();
    }
}
