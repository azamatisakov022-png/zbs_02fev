package kg.eco.operator.service.impl;

import kg.eco.operator.entity.CollectionPoint;
import kg.eco.operator.entity.Landfill;
import kg.eco.operator.entity.Recycler;
import kg.eco.operator.entity.enums.CollectionPointStatus;
import kg.eco.operator.entity.enums.LandfillStatus;
import kg.eco.operator.entity.enums.RecyclerStatus;
import kg.eco.operator.repository.*;
import kg.eco.operator.service.PublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicServiceImpl implements PublicService {

    private final RateRepository rateRepository;
    private final RecyclerRepository recyclerRepository;
    private final LandfillRepository landfillRepository;
    private final CollectionPointRepository collectionPointRepository;
    private final CategoryRepository categoryRepository;
    private final RecyclingNormRepository recyclingNormRepository;

    @Override
    public Map<String, Object> calculate(Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");

        if (items == null || items.isEmpty()) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("items", List.of());
            result.put("totalAmount", BigDecimal.ZERO);
            return result;
        }

        // Build category→rate lookup
        Map<String, BigDecimal> ratesByGroup = new HashMap<>();
        rateRepository.findAll().forEach(rate -> {
            String groupName = rate.getCategory().getName();
            ratesByGroup.put(groupName, rate.getRatePerUnit());
        });

        // Build category→norm lookup
        int currentYear = java.time.LocalDate.now().getYear();
        Map<String, BigDecimal> normsByGroup = new HashMap<>();
        recyclingNormRepository.findAll().forEach(norm -> {
            if (norm.getYear() == currentYear) {
                normsByGroup.put(norm.getCategory().getName(), norm.getNormPercent());
            }
        });

        List<Map<String, Object>> resultItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (Map<String, Object> item : items) {
            String productGroup = (String) item.get("productGroup");
            Number weightNum = (Number) item.get("weight");
            BigDecimal weight = weightNum != null
                    ? BigDecimal.valueOf(weightNum.doubleValue())
                    : BigDecimal.ZERO;

            BigDecimal rate = ratesByGroup.getOrDefault(productGroup, BigDecimal.ZERO);
            BigDecimal norm = normsByGroup.getOrDefault(productGroup, BigDecimal.ZERO);

            // Усб = Ставка × Масса(тонн) × (1 - Нпер/100)
            BigDecimal factor = BigDecimal.ONE.subtract(
                    norm.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
            BigDecimal amount = rate.multiply(weight).multiply(factor)
                    .setScale(2, RoundingMode.HALF_UP);

            Map<String, Object> resultItem = new LinkedHashMap<>();
            resultItem.put("productGroup", productGroup);
            resultItem.put("weight", weight);
            resultItem.put("rate", rate);
            resultItem.put("amount", amount);
            resultItems.add(resultItem);

            totalAmount = totalAmount.add(amount);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", resultItems);
        result.put("totalAmount", totalAmount);
        return result;
    }

    @Override
    public List<Map<String, Object>> getRecyclers(String region, String wasteGroup) {
        List<Recycler> recyclers = recyclerRepository.findByStatus(RecyclerStatus.ACTIVE);

        if (region != null && !region.isBlank()) {
            recyclers = recyclers.stream()
                    .filter(r -> region.equals(r.getRegion()))
                    .collect(Collectors.toList());
        }

        if (wasteGroup != null && !wasteGroup.isBlank()) {
            recyclers = recyclers.stream()
                    .filter(r -> r.getCapacities() != null && r.getCapacities().stream()
                            .anyMatch(c -> wasteGroup.equals(c.getWasteGroup())))
                    .collect(Collectors.toList());
        }

        return recyclers.stream()
                .map(r -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", r.getId());
                    map.put("companyName", r.getCompanyName());
                    map.put("region", r.getRegion());
                    map.put("wasteTypes", r.getCapacities() != null
                            ? r.getCapacities().stream()
                                .map(c -> c.getWasteGroup())
                                .distinct()
                                .collect(Collectors.toList())
                            : List.of());
                    map.put("status", r.getStatus().name());
                    map.put("latitude", r.getLatitude());
                    map.put("longitude", r.getLongitude());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getLandfills(String region) {
        List<Landfill> landfills;
        if (region != null && !region.isBlank()) {
            landfills = landfillRepository.findByRegion(region);
        } else {
            landfills = landfillRepository.findAll();
        }

        return landfills.stream()
                .map(l -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", l.getId());
                    map.put("name", l.getName());
                    map.put("type", l.getType() != null ? l.getType().name() : null);
                    map.put("region", l.getRegion());
                    map.put("address", l.getAddress());
                    map.put("latitude", l.getLatitude());
                    map.put("longitude", l.getLongitude());
                    map.put("area", l.getArea());
                    map.put("designCapacity", l.getDesignCapacity());
                    map.put("currentVolume", l.getCurrentVolume());
                    map.put("fillPercent", l.getFillPercent());
                    map.put("yearOpened", l.getYearOpened());
                    map.put("status", l.getStatus() != null ? l.getStatus().name() : null);
                    map.put("operator", l.getOperator());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getCollectionPoints(String region) {
        List<CollectionPoint> points;
        if (region != null && !region.isBlank()) {
            points = collectionPointRepository.findByRegion(region);
        } else {
            points = collectionPointRepository.findAll();
        }

        return points.stream()
                .map(p -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", p.getId());
                    map.put("name", p.getName());
                    map.put("region", p.getRegion());
                    map.put("address", p.getAddress());
                    map.put("latitude", p.getLatitude());
                    map.put("longitude", p.getLongitude());
                    map.put("wasteTypes", p.getWasteTypes() != null
                            ? Arrays.asList(p.getWasteTypes()) : List.of());
                    map.put("operatingHours", p.getOperatingHours());
                    map.put("contactPhone", p.getContactPhone());
                    map.put("operator", p.getOperator());
                    map.put("status", p.getStatus() != null ? p.getStatus().name() : null);
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getRates() {
        return rateRepository.findAll().stream()
                .map(rate -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("productGroup", rate.getCategory().getName());
                    map.put("unit", rate.getCategory().getUnit() != null
                            ? rate.getCategory().getUnit() : "тонн");
                    map.put("rate", rate.getRatePerUnit());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getFaq() {
        List<Map<String, Object>> faq = new ArrayList<>();

        faq.add(faqItem(1, "Что такое утилизационный сбор (РОП)?",
                "Расширенная ответственность производителя (РОП) — это механизм, при котором производители и импортёры обязаны оплачивать утилизацию своей продукции после окончания её жизненного цикла. Утилизационный сбор рассчитывается по формуле: Усб = Ставка × Масса × (1 - Нпер/100).",
                "Общие вопросы"));

        faq.add(faqItem(2, "Кто является плательщиком утилизационного сбора?",
                "Плательщиками являются производители и импортёры товаров, подлежащих утилизации, зарегистрированные на территории Кыргызской Республики. Перечень групп продукции утверждён ПКМ КР №730.",
                "Общие вопросы"));

        faq.add(faqItem(3, "Как рассчитывается утилизационный сбор?",
                "Формула расчёта: Усб = Ставка × Масса(тонн) × (1 - Нпер/100), где Ставка — тариф по ПКМ №730, Масса — вес продукции в тоннах, Нпер — норматив переработки по ПКМ №563 (%). Воспользуйтесь калькулятором на нашем сайте для быстрого расчёта.",
                "Расчёт"));

        faq.add(faqItem(4, "Как подать декларацию?",
                "Декларация подаётся через личный кабинет системы АИС «ГП Эко Оператор». Необходимо зарегистрироваться, заполнить данные о компании, затем создать расчёт утилизационного сбора с указанием видов продукции и объёмов.",
                "Декларирование"));

        faq.add(faqItem(5, "Какие документы необходимы для регистрации?",
                "Для регистрации необходимы: ИНН организации, свидетельство о регистрации юридического лица, контактные данные ответственного лица. Для переработчиков дополнительно требуется лицензия на обращение с отходами и экологический паспорт.",
                "Регистрация"));

        faq.add(faqItem(6, "Как получить возврат утилизационного сбора?",
                "Возврат утилизационного сбора возможен в случаях: излишне уплаченных сумм, ошибок в расчётах, экспорта продукции. Заявление на возврат подаётся через личный кабинет с приложением подтверждающих документов.",
                "Возвраты"));

        faq.add(faqItem(7, "Каковы сроки оплаты утилизационного сбора?",
                "Оплата утилизационного сбора производится в течение 30 календарных дней с момента утверждения расчёта. Реквизиты для оплаты указаны в утверждённом расчёте.",
                "Оплата"));

        faq.add(faqItem(8, "Куда направляются средства утилизационного сбора?",
                "Средства направляются на финансирование программ переработки отходов, развитие инфраструктуры сбора и переработки, поддержку переработчиков, ликвидацию несанкционированных свалок и экологическое просвещение населения.",
                "Общие вопросы"));

        return faq;
    }

    private Map<String, Object> faqItem(int id, String question, String answer, String category) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", id);
        item.put("question", question);
        item.put("answer", answer);
        item.put("category", category);
        return item;
    }
}
