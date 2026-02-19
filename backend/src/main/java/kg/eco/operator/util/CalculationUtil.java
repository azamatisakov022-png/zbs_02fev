package kg.eco.operator.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Утилиты расчёта утилизационного сбора.
 *
 * Формула: Усб = Ставка × Масса × (1 - Нпер/100)
 *
 * где:
 * - Ставка (rate) — сом/тонна по ПКМ №730
 * - Масса (weight) — масса товара в кг (пересчитывается в тонны)
 * - Нпер (recyclingNorm) — норматив переработки (%) по ПКМ №563
 */
public final class CalculationUtil {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private CalculationUtil() {}

    /**
     * Рассчитывает сумму утилизационного сбора для одной позиции.
     *
     * @param rate         ставка (сом/тонна)
     * @param weightKg     масса нетто (кг)
     * @param recyclingNorm норматив переработки (%), может быть null → 0
     * @return сумма утильсбора (сом), округлённая до 2 знаков
     */
    public static BigDecimal calculateItemAmount(BigDecimal rate, BigDecimal weightKg, BigDecimal recyclingNorm) {
        if (rate == null || weightKg == null) {
            return BigDecimal.ZERO;
        }

        // Масса в тоннах
        BigDecimal weightTons = weightKg.divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP);

        // Коэффициент: (1 - Нпер/100)
        BigDecimal normFactor = BigDecimal.ONE;
        if (recyclingNorm != null && recyclingNorm.compareTo(BigDecimal.ZERO) > 0) {
            normFactor = BigDecimal.ONE.subtract(recyclingNorm.divide(HUNDRED, 6, RoundingMode.HALF_UP));
        }

        // Усб = Ставка × Масса(тонн) × (1 - Нпер/100)
        return rate.multiply(weightTons).multiply(normFactor)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Рассчитывает сумму без учёта норматива (для позиций без переработки):
     * Усб = Ставка × Масса
     */
    public static BigDecimal calculateSimpleAmount(BigDecimal rate, BigDecimal weightKg) {
        return calculateItemAmount(rate, weightKg, null);
    }
}
