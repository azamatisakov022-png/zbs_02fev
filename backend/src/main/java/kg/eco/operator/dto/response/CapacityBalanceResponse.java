package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CapacityBalanceResponse {

    /** Суммарная мощность всех активных переработчиков (т/год) */
    private BigDecimal totalCapacity;

    /** Суммарный требуемый объём из расчётов (т) */
    private BigDecimal totalRequiredVolume;

    /** Суммарный фактический объём из отчётов (т) */
    private BigDecimal totalActualVolume;

    /** Средняя загруженность = (requiredVolume / capacity) × 100 */
    private BigDecimal avgUtilization;

    /** Количество групп с дефицитом мощностей */
    private int deficitGroups;

    /** Требуемый объём по группам: { "group_1": 60, "group_4": 36, ... } */
    private Map<String, BigDecimal> requiredByGroup;

    /** Фактический объём по группам: { "group_1": 40, "group_4": 20, ... } */
    private Map<String, BigDecimal> actualByGroup;

    /** Мощность переработчиков по группам: { "group_1": 2400, "group_4": 1800, ... } */
    private Map<String, BigDecimal> capacityByGroup;
}
