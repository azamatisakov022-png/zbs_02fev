package kg.eco.operator.util;

import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Вычисление срока оплаты утилизационного сбора (dueDate).
 *
 * Согласовано с ЭО (2026-05-12):
 *   - производители товаров - ежеквартально, не позднее 15 числа месяца,
 *     следующего за отчётным кварталом;
 *   - импортёры товаров - по факту ввоза, не позднее 15 КАЛЕНДАРНЫХ дней
 *     с момента ввоза (Сб/Вс не пропускаются).
 *
 * Пеня начисляется только ПОСЛЕ dueDate (ст. 37 ч. 3 Кодекса КР № 90).
 */
public final class DueDateCalculator {

    private DueDateCalculator() {}

    /**
     * Производитель: 15-е число месяца, следующего за концом квартала.
     *   Q1 -> 15 апреля
     *   Q2 -> 15 июля
     *   Q3 -> 15 октября
     *   Q4 -> 15 января следующего года
     */
    public static LocalDate forProducer(int year, String quarter) {
        if (quarter == null) return null;
        String q = quarter.trim().toUpperCase();
        if (q.startsWith("Q")) q = q.substring(1);
        return switch (q) {
            case "1" -> LocalDate.of(year, 4, 15);
            case "2" -> LocalDate.of(year, 7, 15);
            case "3" -> LocalDate.of(year, 10, 15);
            case "4" -> LocalDate.of(year + 1, 1, 15);
            default  -> null;
        };
    }

    /**
     * Импортёр: дата ввоза + 15 КАЛЕНДАРНЫХ дней.
     * Сб и Вс НЕ пропускаются (так согласовано с ЭО).
     */
    public static LocalDate forImporter(LocalDate importDate) {
        if (importDate == null) return null;
        return importDate.plusDays(15);
    }

    /**
     * Универсальный метод: выбирает формулу по payerType.
     */
    public static LocalDate calculate(String payerType, Integer year, String quarter, LocalDate importDate) {
        if (payerType == null) return null;
        return switch (payerType.toLowerCase()) {
            case "producer" -> (year != null) ? forProducer(year, quarter) : null;
            case "importer" -> forImporter(importDate);
            default         -> null;
        };
    }

    /**
     * Добавляет N рабочих дней к дате (пропуская субботу и воскресенье).
     */
    public static LocalDate addWorkingDays(LocalDate start, int days) {
        LocalDate result = start;
        int added = 0;
        while (added < days) {
            result = result.plusDays(1);
            DayOfWeek dow = result.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                added++;
            }
        }
        return result;
    }
}
