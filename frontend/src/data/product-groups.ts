/**
 * Единый справочник 24 групп товаров и упаковки, подлежащих переработке.
 * Источник: Перечень товаров (приложение к постановлению КМ КР).
 * Данные импортированы из файла «Группы и подгруппы.xlsx».
 * Используется в калькуляторе, декларациях, отчётах о переработке.
 */

import wasteGroupsData from './waste-groups.json'

export interface ProductGroup {
  value: string
  label: string
  code: string
  baseRate: number
  unit: string
}

export interface ProductSubgroup {
  value: string
  label: string
  code: string
  rateMultiplier: number
  type: 'product' | 'packaging'
  // Товары (группы 1-18)
  gskpCode?: string
  tnvedCode?: string
  tnvedName?: string
  // Упаковка (группы 19-24)
  packagingMaterial?: string
  packagingLetterCode?: string
  packagingDigitalCode?: string
}

// Полный справочник из Excel (327 позиций в 18 группах товаров + 6 групп упаковки)
export const wasteGroups = wasteGroupsData as Array<{
  id: number
  name: string
  items: Array<{
    name: string
    gskpCode: string
    tnvedCode: string
    tnvedOriginal: string
  }>
}>

// 24 группы: 18 групп товаров + 6 групп упаковки, с базовыми ставками утилизационного сбора (сом/тонна)
export const productGroups: ProductGroup[] = [
  // Группы товаров (1-18)
  { value: 'group_1', label: '1. Изделия из гофрированной бумаги/картона', code: '4808', baseRate: 4200, unit: 'сом/т' },
  { value: 'group_2', label: '2. Изделия из негофрированной бумаги/картона', code: '4819', baseRate: 4200, unit: 'сом/т' },
  { value: 'group_3', label: '3. Масла', code: '2710', baseRate: 12000, unit: 'сом/т' },
  { value: 'group_4', label: '4. Шины, покрышки и камеры резиновые', code: '4011', baseRate: 18000, unit: 'сом/т' },
  { value: 'group_5', label: '5. Изделия из резины (за исключением шин)', code: '4009', baseRate: 12000, unit: 'сом/т' },
  { value: 'group_6', label: '6. Изделия пластмассовые упаковочные', code: '3923', baseRate: 8500, unit: 'сом/т' },
  { value: 'group_7', label: '7. Изделия пластмассовые прочие', code: '3922', baseRate: 10000, unit: 'сом/т' },
  { value: 'group_8', label: '8. Стекло полое', code: '7010', baseRate: 2800, unit: 'сом/т' },
  { value: 'group_9', label: '9. Компьютеры и периферийное оборудование', code: '8471', baseRate: 55000, unit: 'сом/т' },
  { value: 'group_10', label: '10. Мониторы, приёмники телевизионные', code: '8528', baseRate: 35000, unit: 'сом/т' },
  { value: 'group_11', label: '11. Элементы первичные и батареи', code: '8506', baseRate: 120000, unit: 'сом/т' },
  { value: 'group_12', label: '12. Аккумуляторы свинцовые', code: '8507', baseRate: 5000, unit: 'сом/т' },
  { value: 'group_13', label: '13. Батареи аккумуляторные', code: '8507', baseRate: 25000, unit: 'сом/т' },
  { value: 'group_14', label: '14. Оборудование электрическое осветительное', code: '8539', baseRate: 150000, unit: 'сом/т' },
  { value: 'group_15', label: '15. Техника бытовая крупная', code: '8418', baseRate: 22000, unit: 'сом/т' },
  { value: 'group_16', label: '16. Техника бытовая мелкая, инструмент ручной', code: '8516', baseRate: 28000, unit: 'сом/т' },
  { value: 'group_17', label: '17. Оборудование холодильное и вентиляционное', code: '8418', baseRate: 22000, unit: 'сом/т' },
  { value: 'group_18', label: '18. Фильтры для двигателей внутреннего сгорания', code: '8421', baseRate: 35000, unit: 'сом/т' },
  // Группы упаковки (19-24)
  { value: 'group_19', label: '19. Упаковка из пластмасс', code: '3923', baseRate: 8500, unit: 'сом/т' },
  { value: 'group_20', label: '20. Упаковка из бумаги и картона', code: '4819', baseRate: 4200, unit: 'сом/т' },
  { value: 'group_21', label: '21. Упаковка из комбинированных материалов (тетрапак)', code: '4811', baseRate: 6500, unit: 'сом/т' },
  { value: 'group_22', label: '22. Упаковка из стекла', code: '7010', baseRate: 2800, unit: 'сом/т' },
  { value: 'group_23', label: '23. Упаковка из металла', code: '7612', baseRate: 5500, unit: 'сом/т' },
  { value: 'group_24', label: '24. Упаковка из дерева', code: '4415', baseRate: 3200, unit: 'сом/т' },
]

// Подгруппы для каждой из 24 групп с полными данными из waste-groups.json и ТР ТС 005/2011
export const productSubgroups: Record<string, ProductSubgroup[]> = {
  group_1: [
    { value: 'g1_corrugated_paper', label: 'Бумага и картон гофрированные', code: '4808', rateMultiplier: 1.0, type: 'product', gskpCode: '17.12.72.000', tnvedCode: '4808', tnvedName: 'Бумага и картон гофрированные, тисненые или перфорированные' },
    { value: 'g1_corrugated_boxes', label: 'Коробки и ящики из гофрокартона', code: '4819 10', rateMultiplier: 1.0, type: 'product', gskpCode: '17.21.13.000', tnvedCode: '4819 10', tnvedName: 'Коробки, ящики и сумки из гофрированных бумаги или картона' },
    { value: 'g1_corrugated_rolls', label: 'Бумага и картон гофрированные в рулонах', code: '4808', rateMultiplier: 0.9, type: 'product', gskpCode: '17.21.11.000', tnvedCode: '4808', tnvedName: 'Бумага и картон гофрированные в рулонах или листах' },
    { value: 'g1_other', label: 'Прочие изделия из гофрированной бумаги', code: '4823 90', rateMultiplier: 1.0, type: 'product', gskpCode: '17.23.14.000', tnvedCode: '4823 90', tnvedName: 'Бумага и картон прочие, тисненые, гофрированные или перфорированные' },
  ],
  group_2: [
    { value: 'g2_bags_large', label: 'Мешки и пакеты бумажные (от 40 см)', code: '4819', rateMultiplier: 1.0, type: 'product', gskpCode: '17.21.12.300', tnvedCode: '4819', tnvedName: 'Мешки и пакеты бумажные (ширина у основания не менее 40 см)' },
    { value: 'g2_bags_other', label: 'Мешки и пакеты бумажные прочие', code: '4819', rateMultiplier: 1.0, type: 'product', gskpCode: '17.21.12.500', tnvedCode: '4819', tnvedName: 'Мешки и пакеты бумажные прочие' },
    { value: 'g2_boxes', label: 'Коробки и ящики из негофрированного картона', code: '4819', rateMultiplier: 0.9, type: 'product', gskpCode: '17.21.14.000', tnvedCode: '4819', tnvedName: 'Коробки и ящики складные из негофрированных бумаги или картона' },
    { value: 'g2_tableware', label: 'Подносы, тарелки, чашки из бумаги', code: '4823 69', rateMultiplier: 1.1, type: 'product', gskpCode: '17.22.13.000', tnvedCode: '4823 69', tnvedName: 'Подносы, блюда, тарелки и чашки из бумаги или картона' },
    { value: 'g2_stationery', label: 'Канцтовары, журналы, тетради', code: '4820', rateMultiplier: 0.8, type: 'product', gskpCode: '17.23.13.100', tnvedCode: '4820', tnvedName: 'Журналы, книги, блокноты, ежедневники из бумаги или картона' },
    { value: 'g2_wallpaper', label: 'Обои и настенные покрытия', code: '4814', rateMultiplier: 1.0, type: 'product', gskpCode: '17.24.11.000', tnvedCode: '4814', tnvedName: 'Обои и аналогичные материалы для оклеивания стен' },
    { value: 'g2_labels', label: 'Этикетки и ярлыки', code: '4821', rateMultiplier: 1.0, type: 'product', gskpCode: '17.29.11.200', tnvedCode: '4821', tnvedName: 'Этикетки и ярлыки из бумаги или картона' },
    { value: 'g2_bobbins', label: 'Бобины, катушки, шпули', code: '4822', rateMultiplier: 0.9, type: 'product', gskpCode: '17.29.19.200', tnvedCode: '4822', tnvedName: 'Бобины, катушки, шпули из бумажной массы' },
    { value: 'g2_other', label: 'Прочие изделия из бумаги и картона', code: '4823 90', rateMultiplier: 1.0, type: 'product', gskpCode: '17.29.19.900', tnvedCode: '4823 90', tnvedName: 'Изделия из бумаги и картона прочие' },
  ],
  group_3: [
    { value: 'g3_lubricants_special', label: 'Материалы смазочные (менее 70% нефтяных масел)', code: '3403', rateMultiplier: 1.0, type: 'product', gskpCode: '20.59.41.500', tnvedCode: '3403', tnvedName: 'Материалы смазочные (менее 70% нефтяных масел)' },
    { value: 'g3_lubricants_textile', label: 'Смазочные для обработки текстиля, кожи', code: '3403', rateMultiplier: 0.9, type: 'product', gskpCode: '20.59.41.550', tnvedCode: '3403', tnvedName: 'Смазочные для обработки текстиля, кожи и меха' },
    { value: 'g3_oils_petroleum', label: 'Масла нефтяные смазочные', code: '2710 19', rateMultiplier: 1.1, type: 'product', gskpCode: '19.20.29.000', tnvedCode: '2710 19', tnvedName: 'Масла нефтяные смазочные; тяжелые нефтяные дистилляты' },
  ],
  group_4: [
    { value: 'g4_tires_car', label: 'Шины для легковых автомобилей', code: '4011', rateMultiplier: 1.0, type: 'product', gskpCode: '22.11.11.000', tnvedCode: '4011', tnvedName: 'Шины пневматические новые для легковых автомобилей' },
    { value: 'g4_tires_moto', label: 'Шины для мотоциклов и велосипедов', code: '4011', rateMultiplier: 0.8, type: 'product', gskpCode: '22.11.12.000', tnvedCode: '4011', tnvedName: 'Шины пневматические новые для мотоциклов или велосипедов' },
    { value: 'g4_tires_truck', label: 'Шины для грузовых автомобилей и автобусов', code: '4011', rateMultiplier: 1.2, type: 'product', gskpCode: '22.11.13.500', tnvedCode: '4011', tnvedName: 'Шины пневматические новые для автобусов или грузовых автомобилей' },
    { value: 'g4_tires_agri', label: 'Шины для сельскохозяйственных машин', code: '4011', rateMultiplier: 1.1, type: 'product', gskpCode: '22.11.14.000', tnvedCode: '4011', tnvedName: 'Шины для сельскохозяйственных машин' },
    { value: 'g4_tires_aircraft', label: 'Шины для использования в авиации', code: '4011', rateMultiplier: 1.3, type: 'product', gskpCode: '22.11.13.700', tnvedCode: '4011', tnvedName: 'Шины пневматические новые для использования в авиации' },
    { value: 'g4_solid_tires', label: 'Шины массивные или полупневматические', code: '4012', rateMultiplier: 1.0, type: 'product', gskpCode: '22.11.15.300', tnvedCode: '4012', tnvedName: 'Шины массивные или полупневматические, сменные протекторы' },
    { value: 'g4_tubes', label: 'Камеры резиновые', code: '4013', rateMultiplier: 0.9, type: 'product', gskpCode: '22.11.15.700', tnvedCode: '4013', tnvedName: 'Камеры резиновые' },
    { value: 'g4_rim_strips', label: 'Ленты ободные резиновые', code: '4012', rateMultiplier: 0.8, type: 'product', gskpCode: '22.11.15.500', tnvedCode: '4012', tnvedName: 'Ленты ободные резиновые' },
    { value: 'g4_retreaded', label: 'Шины восстановленные', code: '4012', rateMultiplier: 0.7, type: 'product', gskpCode: '22.11.20.300', tnvedCode: '4012', tnvedName: 'Шины пневматические резиновые восстановленные' },
  ],
  group_5: [
    { value: 'g5_pipes', label: 'Трубы и трубки из вулканизированной резины', code: '4009', rateMultiplier: 1.0, type: 'product', gskpCode: '22.19.30.300', tnvedCode: '4009', tnvedName: 'Трубы и трубки из вулканизированной резины неармированные' },
    { value: 'g5_hoses', label: 'Рукава и шланги армированные', code: '4009', rateMultiplier: 1.1, type: 'product', gskpCode: '22.19.30.500', tnvedCode: '4009', tnvedName: 'Рукава и шланги из вулканизированной резины армированные' },
    { value: 'g5_belts', label: 'Ремни приводные и ленты конвейерные', code: '4010', rateMultiplier: 1.0, type: 'product', gskpCode: '22.19.40.300', tnvedCode: '4010', tnvedName: 'Ремни приводные из вулканизированной резины' },
    { value: 'g5_clothing', label: 'Одежда и аксессуары из резины', code: '4015', rateMultiplier: 1.2, type: 'product', gskpCode: '22.19.60.000', tnvedCode: '4015', tnvedName: 'Одежда и аксессуары из вулканизированной резины' },
    { value: 'g5_flooring', label: 'Покрытия напольные из резины', code: '4016', rateMultiplier: 0.9, type: 'product', gskpCode: '22.19.72.000', tnvedCode: '4016', tnvedName: 'Покрытия напольные из непористой вулканизированной резины' },
    { value: 'g5_technical', label: 'Изделия резиновые технические', code: '4016', rateMultiplier: 1.0, type: 'product', gskpCode: '22.19.73.600', tnvedCode: '4016', tnvedName: 'Изделия из вулканизированной резины технические' },
    { value: 'g5_ebonite', label: 'Резина твёрдая (эбонит)', code: '4017', rateMultiplier: 1.0, type: 'product', gskpCode: '22.19.73.700', tnvedCode: '4017', tnvedName: 'Резина твёрдая (эбонит) и изделия из неё' },
  ],
  group_6: [
    { value: 'g6_bags_pe', label: 'Мешки и сумки из полиэтилена', code: '3923', rateMultiplier: 1.0, type: 'product', gskpCode: '22.22.11.000', tnvedCode: '3923', tnvedName: 'Мешки и сумки из полимеров этилена' },
    { value: 'g6_bags_other', label: 'Мешки и сумки из прочих пластмасс', code: '3923', rateMultiplier: 1.0, type: 'product', gskpCode: '22.22.12.000', tnvedCode: '3923', tnvedName: 'Мешки и сумки из прочих пластмасс' },
    { value: 'g6_boxes', label: 'Коробки, ящики, корзины из пластмасс', code: '3923', rateMultiplier: 0.9, type: 'product', gskpCode: '22.22.13.000', tnvedCode: '3923', tnvedName: 'Коробки, ящики, корзины из пластмасс' },
    { value: 'g6_bottles_small', label: 'Бутылки и флаконы до 2 л', code: '3923', rateMultiplier: 1.0, type: 'product', gskpCode: '22.22.14.500', tnvedCode: '3923', tnvedName: 'Бутылки и флаконы из пластмасс (до 2 л)' },
    { value: 'g6_bottles_large', label: 'Бутылки и канистры более 2 л', code: '3923', rateMultiplier: 0.9, type: 'product', gskpCode: '22.22.14.700', tnvedCode: '3923', tnvedName: 'Бутылки и канистры из пластмасс (более 2 л)' },
    { value: 'g6_caps', label: 'Пробки, крышки, колпачки из пластмасс', code: '3923', rateMultiplier: 1.1, type: 'product', gskpCode: '22.22.19.200', tnvedCode: '3923', tnvedName: 'Пробки, крышки и колпачки из пластмасс' },
    { value: 'g6_other', label: 'Прочая упаковочная тара из пластмасс', code: '3923', rateMultiplier: 1.0, type: 'product', gskpCode: '22.22.19.500', tnvedCode: '3923', tnvedName: 'Изделия из пластмасс для упаковывания прочие' },
  ],
  group_7: [
    { value: 'g7_sanitary', label: 'Ванны, раковины, унитазы из пластмасс', code: '3922', rateMultiplier: 1.0, type: 'product', gskpCode: '22.23.12.500', tnvedCode: '3922', tnvedName: 'Ванны, раковины и души из пластмасс' },
    { value: 'g7_tanks', label: 'Резервуары и ёмкости свыше 300 л', code: '3925', rateMultiplier: 0.9, type: 'product', gskpCode: '22.23.13.000', tnvedCode: '3925', tnvedName: 'Резервуары и ёмкости свыше 300 л из пластмасс' },
    { value: 'g7_construction', label: 'Двери, окна, ставни из пластмасс', code: '3925', rateMultiplier: 1.0, type: 'product', gskpCode: '22.23.14.500', tnvedCode: '3925', tnvedName: 'Двери, окна, ставни из пластмасс' },
    { value: 'g7_clothing', label: 'Одежда и аксессуары из пластмасс', code: '3926 20', rateMultiplier: 1.1, type: 'product', gskpCode: '22.29.10.000', tnvedCode: '3926 20', tnvedName: 'Одежда и аксессуары из пластмасс' },
    { value: 'g7_self_adhesive', label: 'Плёнки и ленты самоклеящиеся', code: '3919', rateMultiplier: 1.0, type: 'product', gskpCode: '22.29.21.300', tnvedCode: '3919', tnvedName: 'Полосы и ленты самоклеящиеся из пластмасс' },
    { value: 'g7_tableware', label: 'Посуда столовая и кухонная', code: '3924', rateMultiplier: 1.0, type: 'product', gskpCode: '22.29.23.200', tnvedCode: '3924', tnvedName: 'Посуда столовая и кухонная из пластмасс' },
    { value: 'g7_stationery', label: 'Канцтовары из пластмасс', code: '3926 10', rateMultiplier: 0.9, type: 'product', gskpCode: '22.29.25.000', tnvedCode: '3926 10', tnvedName: 'Канцелярские и школьные принадлежности из пластмасс' },
    { value: 'g7_decorative', label: 'Статуэтки и декоративные изделия', code: '3926 40', rateMultiplier: 1.0, type: 'product', gskpCode: '22.29.26.200', tnvedCode: '3926 40', tnvedName: 'Статуэтки и прочие декоративные изделия из пластмасс' },
    { value: 'g7_christmas', label: 'Ёлки искусственные и украшения', code: '9505 90', rateMultiplier: 1.0, type: 'product', gskpCode: '32.99.51.111', tnvedCode: '9505 90', tnvedName: 'Ёлки искусственные, игрушки и украшения' },
    { value: 'g7_other', label: 'Прочие изделия из пластмасс', code: '3926', rateMultiplier: 1.0, type: 'product', gskpCode: '22.29.29.100', tnvedCode: '3926', tnvedName: 'Изделия из пластмасс прочие' },
  ],
  group_8: [
    { value: 'g8_jars', label: 'Банки для консервирования', code: '7010', rateMultiplier: 1.0, type: 'product', gskpCode: '23.13.11.100', tnvedCode: '7010', tnvedName: 'Банки для консервирования из стекла' },
    { value: 'g8_bottles_clear', label: 'Бутылки из бесцветного стекла', code: '7010', rateMultiplier: 1.0, type: 'product', gskpCode: '23.13.11.400', tnvedCode: '7010', tnvedName: 'Бутылки из бесцветного стекла' },
    { value: 'g8_bottles_colored', label: 'Бутылки из цветного стекла', code: '7010', rateMultiplier: 1.0, type: 'product', gskpCode: '23.13.11.500', tnvedCode: '7010', tnvedName: 'Бутылки из цветного стекла' },
    { value: 'g8_containers_large', label: 'Ёмкости стеклянные (от 2.5 л)', code: '7010', rateMultiplier: 0.9, type: 'product', gskpCode: '23.13.11.300', tnvedCode: '7010', tnvedName: 'Ёмкости стеклянные (не менее 2,5 л)' },
    { value: 'g8_containers_food', label: 'Ёмкости для напитков и пищевых продуктов', code: '7010', rateMultiplier: 1.0, type: 'product', gskpCode: '23.13.11.600', tnvedCode: '7010', tnvedName: 'Ёмкости стеклянные для напитков и пищевых продуктов' },
    { value: 'g8_containers_pharma', label: 'Ёмкости для фармацевтической продукции', code: '7010', rateMultiplier: 1.1, type: 'product', gskpCode: '23.13.11.700', tnvedCode: '7010', tnvedName: 'Ёмкости стеклянные для фармацевтической продукции' },
    { value: 'g8_other', label: 'Прочие стеклянные ёмкости', code: '7010', rateMultiplier: 1.0, type: 'product', gskpCode: '23.13.11.800', tnvedCode: '7010', tnvedName: 'Ёмкости стеклянные прочие' },
  ],
  group_9: [
    { value: 'g9_laptops', label: 'Ноутбуки и портативные ПК', code: '8471', rateMultiplier: 1.0, type: 'product', gskpCode: '26.20.11.000', tnvedCode: '8471', tnvedName: 'Машины вычислительные портативные (ноутбуки)' },
    { value: 'g9_desktops', label: 'Настольные компьютеры', code: '8471', rateMultiplier: 1.0, type: 'product', gskpCode: '26.20.13.000', tnvedCode: '8471', tnvedName: 'Машины вычислительные настольные' },
    { value: 'g9_peripherals', label: 'Клавиатуры, устройства ввода/вывода', code: '8471', rateMultiplier: 0.8, type: 'product', gskpCode: '26.20.16.500', tnvedCode: '8471', tnvedName: 'Клавиатуры и устройства ввода/вывода' },
    { value: 'g9_storage', label: 'Накопители и устройства хранения данных', code: '8471', rateMultiplier: 0.9, type: 'product', gskpCode: '26.20.21.000', tnvedCode: '8471', tnvedName: 'Устройства запоминающие (накопители)' },
    { value: 'g9_printers', label: 'Принтеры, сканеры, МФУ', code: '8443 31', rateMultiplier: 0.9, type: 'product', gskpCode: '26.20.18.000', tnvedCode: '8443 31', tnvedName: 'Устройства печати, копирования и факсимильной передачи' },
    { value: 'g9_terminals', label: 'Терминалы, банкоматы', code: '8472', rateMultiplier: 1.0, type: 'product', gskpCode: '26.20.12.000', tnvedCode: '8472', tnvedName: 'Терминалы торговые, банкоматы' },
    { value: 'g9_tv_transmit', label: 'Аппаратура передающая радио/ТВ', code: '8525', rateMultiplier: 1.1, type: 'product', gskpCode: '26.30.11.000', tnvedCode: '8525', tnvedName: 'Аппаратура передающая для радиовещания или телевидения' },
    { value: 'g9_phones_wired', label: 'Телефоны проводные', code: '8517', rateMultiplier: 0.8, type: 'product', gskpCode: '26.30.21.000', tnvedCode: '8517', tnvedName: 'Аппараты телефонные для проводной связи' },
    { value: 'g9_phones_mobile', label: 'Мобильные телефоны и смартфоны', code: '8517', rateMultiplier: 1.3, type: 'product', gskpCode: '26.30.22.000', tnvedCode: '8517', tnvedName: 'Телефоны для сотовых и беспроводных сетей' },
    { value: 'g9_network', label: 'Сетевое оборудование (маршрутизаторы, коммутаторы)', code: '8517', rateMultiplier: 1.0, type: 'product', gskpCode: '26.30.23.200', tnvedCode: '8517', tnvedName: 'Маршрутизаторы и коммутационные устройства' },
    { value: 'g9_antennas', label: 'Антенны и отражатели', code: '8529 10', rateMultiplier: 0.7, type: 'product', gskpCode: '26.30.40.100', tnvedCode: '8529 10', tnvedName: 'Антенны и отражатели всех типов' },
    { value: 'g9_security', label: 'Охранная и противопожарная аппаратура', code: '8531 10', rateMultiplier: 1.0, type: 'product', gskpCode: '26.30.50.200', tnvedCode: '8531 10', tnvedName: 'Аппаратура электрическая охранная и противопожарная' },
    { value: 'g9_radio', label: 'Радиоприёмники', code: '8527', rateMultiplier: 0.9, type: 'product', gskpCode: '26.40.11.000', tnvedCode: '8527', tnvedName: 'Радиоприёмники широковещательные' },
    { value: 'g9_audio', label: 'Звуковоспроизводящая аппаратура', code: '8519', rateMultiplier: 1.0, type: 'product', gskpCode: '26.40.31.000', tnvedCode: '8519', tnvedName: 'Звуковоспроизводящая аппаратура' },
    { value: 'g9_video', label: 'Видеозаписывающая аппаратура', code: '8521', rateMultiplier: 1.0, type: 'product', gskpCode: '26.40.33.000', tnvedCode: '8521', tnvedName: 'Видеозаписывающая или воспроизводящая аппаратура' },
    { value: 'g9_projectors', label: 'Видеопроекторы', code: '8528 69', rateMultiplier: 1.0, type: 'product', gskpCode: '26.40.34.200', tnvedCode: '8528 69', tnvedName: 'Видеопроекторы' },
    { value: 'g9_speakers', label: 'Микрофоны, громкоговорители, наушники', code: '8518', rateMultiplier: 0.9, type: 'product', gskpCode: '26.40.41.000', tnvedCode: '8518', tnvedName: 'Микрофоны, громкоговорители, наушники' },
    { value: 'g9_amplifiers', label: 'Электроусилители звуковых частот', code: '8518', rateMultiplier: 1.0, type: 'product', gskpCode: '26.40.43.500', tnvedCode: '8518', tnvedName: 'Электроусилители звуковых частот' },
    { value: 'g9_game_consoles', label: 'Игровые приставки (консоли)', code: '9504 50', rateMultiplier: 1.1, type: 'product', gskpCode: '26.40.60.000', tnvedCode: '9504 50', tnvedName: 'Консоли для видеоигр' },
    { value: 'g9_measuring', label: 'Измерительные приборы и аппаратура', code: '9030', rateMultiplier: 1.0, type: 'product', gskpCode: '26.51.41.000', tnvedCode: '9030', tnvedName: 'Приборы и аппаратура для измерений' },
    { value: 'g9_optical', label: 'Фотокамеры, бинокли, микроскопы', code: '9006', rateMultiplier: 1.0, type: 'product', gskpCode: '26.70.14.000', tnvedCode: '9006', tnvedName: 'Фотокамеры и оптические приборы' },
    { value: 'g9_watches', label: 'Часы наручные и карманные', code: '9101', rateMultiplier: 1.2, type: 'product', gskpCode: '26.52.11.000', tnvedCode: '9101', tnvedName: 'Часы наручные и карманные' },
    { value: 'g9_radar', label: 'Радиолокационная и навигационная аппаратура', code: '8526', rateMultiplier: 1.0, type: 'product', gskpCode: '26.51.20.200', tnvedCode: '8526', tnvedName: 'Аппаратура радиолокационная и навигационная' },
  ],
  group_10: [
    { value: 'g10_tv_projection', label: 'Телевизоры проекционные', code: '8528', rateMultiplier: 1.0, type: 'product', gskpCode: '26.40.20.400', tnvedCode: '8528', tnvedName: 'Оборудование телевизионное проекционное' },
    { value: 'g10_tv_receivers', label: 'Приёмники телевизионные', code: '8528', rateMultiplier: 1.0, type: 'product', gskpCode: '26.40.20.900', tnvedCode: '8528', tnvedName: 'Приёмники телевизионные' },
    { value: 'g10_monitors_pc', label: 'Мониторы для компьютеров', code: '8528', rateMultiplier: 1.0, type: 'product', gskpCode: '26.20.17.000', tnvedCode: '8528', tnvedName: 'Мониторы для систем обработки данных' },
    { value: 'g10_monitors_lcd', label: 'Видеомониторы (ЖК, плазменные)', code: '8528', rateMultiplier: 1.0, type: 'product', gskpCode: '26.40.34.600', tnvedCode: '8528', tnvedName: 'Видеомониторы ЖК и плазменные' },
    { value: 'g10_monitors_bw', label: 'Мониторы чёрно-белые', code: '8528', rateMultiplier: 0.8, type: 'product', gskpCode: '26.40.34.800', tnvedCode: '8528', tnvedName: 'Видеомониторы чёрно-белые' },
  ],
  group_11: [
    { value: 'g11_primary', label: 'Элементы первичные и батареи первичных элементов', code: '8506', rateMultiplier: 1.0, type: 'product', gskpCode: '27.20.11.000', tnvedCode: '8506', tnvedName: 'Элементы первичные и батареи первичных элементов' },
  ],
  group_12: [
    { value: 'g12_starter', label: 'Аккумуляторы свинцовые стартерные', code: '8507 10', rateMultiplier: 1.0, type: 'product', gskpCode: '27.20.21.000', tnvedCode: '8507 10', tnvedName: 'Аккумуляторы свинцовые для запуска поршневых двигателей' },
    { value: 'g12_other', label: 'Аккумуляторы свинцово-кислотные прочие', code: '8507 20', rateMultiplier: 1.1, type: 'product', gskpCode: '27.20.22.000', tnvedCode: '8507 20', tnvedName: 'Аккумуляторы свинцово-кислотные прочие' },
  ],
  group_13: [
    { value: 'g13_rechargeable', label: 'Аккумуляторы NiCd, NiMH, Li-ion, Li-polymer и прочие', code: '8507 30', rateMultiplier: 1.0, type: 'product', gskpCode: '27.20.23.000', tnvedCode: '8507 30', tnvedName: 'Аккумуляторы NiCd, NiMH, Li-ion, Li-polymer и прочие' },
  ],
  group_14: [
    { value: 'g14_mercury_high', label: 'Лампы ртутные высокого давления', code: '8539', rateMultiplier: 1.0, type: 'product', gskpCode: '27.40.1', tnvedCode: '8539', tnvedName: 'Лампы ртутные высокого давления' },
    { value: 'g14_sodium_high', label: 'Лампы натриевые высокого давления', code: '8539', rateMultiplier: 1.0, type: 'product', gskpCode: '27.40.1', tnvedCode: '8539', tnvedName: 'Лампы натриевые высокого давления' },
    { value: 'g14_sodium_low', label: 'Лампы натриевые низкого давления', code: '8539', rateMultiplier: 1.0, type: 'product', gskpCode: '27.40.1', tnvedCode: '8539', tnvedName: 'Лампы натриевые низкого давления' },
    { value: 'g14_fluorescent', label: 'Лампы люминесцентные', code: '8539', rateMultiplier: 1.0, type: 'product', gskpCode: '27.40.15.100', tnvedCode: '8539', tnvedName: 'Лампы люминесцентные' },
    { value: 'g14_metal_halide', label: 'Лампы металлогалогенные', code: '8539', rateMultiplier: 1.0, type: 'product', gskpCode: '27.40.1', tnvedCode: '8539', tnvedName: 'Лампы металлогалогенные' },
    { value: 'g14_uv_ir', label: 'Лампы ультрафиолетовые и инфракрасные', code: '8539', rateMultiplier: 1.0, type: 'product', gskpCode: '27.40.15.700', tnvedCode: '8539', tnvedName: 'Лампы ультрафиолетовые и инфракрасные' },
    { value: 'g14_arc', label: 'Лампы дуговые', code: '8539', rateMultiplier: 1.0, type: 'product', gskpCode: '27.40.15.700', tnvedCode: '8539', tnvedName: 'Лампы дуговые' },
    { value: 'g14_other', label: 'Лампы газоразрядные прочие', code: '8539', rateMultiplier: 1.0, type: 'product', gskpCode: '27.40.15.100', tnvedCode: '8539', tnvedName: 'Лампы газоразрядные прочие' },
  ],
  group_15: [
    { value: 'g15_dishwashers', label: 'Посудомоечные машины', code: '8422 11', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.12.000', tnvedCode: '8422 11', tnvedName: 'Машины посудомоечные бытовые' },
    { value: 'g15_washing', label: 'Стиральные машины и сушилки', code: '8450', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.13.000', tnvedCode: '8450', tnvedName: 'Машины стиральные и сушилки бытовые' },
    { value: 'g15_ovens', label: 'Печи встраиваемые электрические', code: '8516 60', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.28.700', tnvedCode: '8516 60', tnvedName: 'Печи встраиваемые электрические бытовые' },
    { value: 'g15_stoves', label: 'Электроплиты (с духовым шкафом)', code: '8516 60', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.28.100', tnvedCode: '8516 60', tnvedName: 'Электроплиты с духовым шкафом бытовые' },
    { value: 'g15_gas_stoves', label: 'Газовые плиты и духовки', code: '7321', rateMultiplier: 0.9, type: 'product', gskpCode: '27.52.11.100', tnvedCode: '7321', tnvedName: 'Газовые плиты и духовки бытовые' },
  ],
  group_16: [
    { value: 'g16_blankets', label: 'Одеяла электрические', code: '6301 10', rateMultiplier: 0.8, type: 'product', gskpCode: '27.51.14.000', tnvedCode: '6301 10', tnvedName: 'Одеяла электрические' },
    { value: 'g16_fans', label: 'Вентиляторы бытовые', code: '8414 51', rateMultiplier: 0.9, type: 'product', gskpCode: '27.51.15.300', tnvedCode: '8414 51', tnvedName: 'Вентиляторы бытовые' },
    { value: 'g16_hoods', label: 'Вытяжные шкафы и колпаки', code: '8414 60', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.15.800', tnvedCode: '8414 60', tnvedName: 'Шкафы и колпаки вытяжные бытовые' },
    { value: 'g16_vacuum', label: 'Пылесосы бытовые', code: '8508', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.21.200', tnvedCode: '8508', tnvedName: 'Пылесосы бытовые со встроенным электродвигателем' },
    { value: 'g16_food_processors', label: 'Измельчители, миксеры, соковыжималки', code: '8509 40', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.21.700', tnvedCode: '8509 40', tnvedName: 'Измельчители, миксеры и соковыжималки бытовые' },
    { value: 'g16_razors', label: 'Электробритвы и машинки для стрижки', code: '8510', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.22.000', tnvedCode: '8510', tnvedName: 'Электробритвы и машинки для стрижки' },
    { value: 'g16_hair_dryers', label: 'Электросушители и приборы для волос', code: '8516 31', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.23.100', tnvedCode: '8516 31', tnvedName: 'Электросушители для волос' },
    { value: 'g16_irons', label: 'Электроутюги', code: '8516 40', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.23.700', tnvedCode: '8516 40', tnvedName: 'Электроутюги' },
    { value: 'g16_kettles', label: 'Электрокофеварки и электрочайники', code: '8516 71', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.24.300', tnvedCode: '8516 71', tnvedName: 'Электрокофеварки и электрочайники бытовые' },
    { value: 'g16_toasters', label: 'Тостеры', code: '8516 72', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.24.500', tnvedCode: '8516 72', tnvedName: 'Электротостеры бытовые' },
    { value: 'g16_heaters', label: 'Электронагреватели и радиаторы', code: '8516 10', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.25.300', tnvedCode: '8516 10', tnvedName: 'Электронагреватели и радиаторы' },
    { value: 'g16_microwaves', label: 'Печи микроволновые', code: '8516 50', rateMultiplier: 1.1, type: 'product', gskpCode: '27.51.27.000', tnvedCode: '8516 50', tnvedName: 'Печи бытовые микроволновые' },
    { value: 'g16_grills', label: 'Грили и ростеры', code: '8516 60', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.28.500', tnvedCode: '8516 60', tnvedName: 'Грили и ростеры электрические бытовые' },
    { value: 'g16_drills', label: 'Дрели ручные электромеханические', code: '8467', rateMultiplier: 1.0, type: 'product', gskpCode: '28.24.11.100', tnvedCode: '8467', tnvedName: 'Дрели ручные электромеханические' },
    { value: 'g16_saws', label: 'Пилы ручные электромеханические', code: '8467', rateMultiplier: 1.0, type: 'product', gskpCode: '28.24.11.100', tnvedCode: '8467', tnvedName: 'Пилы ручные электромеханические' },
    { value: 'g16_tools', label: 'Прочие электроинструменты ручные', code: '8467', rateMultiplier: 1.0, type: 'product', gskpCode: '28.24.11.100', tnvedCode: '8467', tnvedName: 'Электроинструменты ручные прочие' },
    { value: 'g16_other', label: 'Прочая мелкая бытовая техника', code: '8516 79', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.24.900', tnvedCode: '8516 79', tnvedName: 'Приборы бытовые электронагревательные прочие' },
  ],
  group_17: [
    { value: 'g17_fridge_combi', label: 'Холодильники-морозильники комбинированные', code: '8418', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.11.100', tnvedCode: '8418', tnvedName: 'Холодильники-морозильники комбинированные' },
    { value: 'g17_fridges', label: 'Холодильники бытовые', code: '8418', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.11.300', tnvedCode: '8418', tnvedName: 'Холодильники бытовые' },
    { value: 'g17_freezers_chest', label: 'Морозильники типа ларь (до 800 л)', code: '8418', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.11.500', tnvedCode: '8418', tnvedName: 'Морозильники типа ларь (до 800 л)' },
    { value: 'g17_freezers_upright', label: 'Морозильники вертикального типа (до 900 л)', code: '8418', rateMultiplier: 1.0, type: 'product', gskpCode: '27.51.11.700', tnvedCode: '8418', tnvedName: 'Морозильники вертикального типа (до 900 л)' },
    { value: 'g17_ac_split', label: 'Кондиционеры (сплит-системы)', code: '8415', rateMultiplier: 1.1, type: 'product', gskpCode: '28.25.12.200', tnvedCode: '8415', tnvedName: 'Кондиционеры (сплит-системы)' },
    { value: 'g17_ac_vehicle', label: 'Кондиционеры для транспорта', code: '8415', rateMultiplier: 1.0, type: 'product', gskpCode: '28.25.12.400', tnvedCode: '8415', tnvedName: 'Кондиционеры для транспорта' },
    { value: 'g17_showcases', label: 'Витрины и прилавки холодильные', code: '8418', rateMultiplier: 1.0, type: 'product', gskpCode: '28.25.13.300', tnvedCode: '8418', tnvedName: 'Витрины и прилавки холодильные' },
    { value: 'g17_commercial', label: 'Прочее холодильное оборудование', code: '8418', rateMultiplier: 1.0, type: 'product', gskpCode: '28.25.13.900', tnvedCode: '8418', tnvedName: 'Оборудование холодильное прочее' },
  ],
  group_18: [
    { value: 'g18_oil_fuel', label: 'Фильтры масляные и топливные', code: '8421 23', rateMultiplier: 1.0, type: 'product', gskpCode: '28.29.13.300', tnvedCode: '8421 23', tnvedName: 'Фильтры для топлива и масла в ДВС' },
    { value: 'g18_air', label: 'Фильтры воздушные для ДВС', code: '8421 31', rateMultiplier: 0.9, type: 'product', gskpCode: '28.29.13.500', tnvedCode: '8421 31', tnvedName: 'Фильтры воздушные всасывающие для ДВС' },
  ],
  // Группы упаковки (19-24) — данные по ТР ТС 005/2011
  group_19: [
    { value: 'g19_pet_bottles', label: 'ПЭТ-бутылки', code: '3923 30', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Полиэтилентерефталат', packagingLetterCode: 'PET', packagingDigitalCode: '1' },
    { value: 'g19_pe_film', label: 'Полиэтиленовая плёнка', code: '3923 21', rateMultiplier: 0.9, type: 'packaging', packagingMaterial: 'Полиэтилен низкой плотности', packagingLetterCode: 'LDPE', packagingDigitalCode: '4' },
    { value: 'g19_pp_packaging', label: 'Полипропиленовая упаковка', code: '3923 29', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Полипропилен', packagingLetterCode: 'PP', packagingDigitalCode: '5' },
    { value: 'g19_ps_packaging', label: 'Упаковка из полистирола', code: '3923 90', rateMultiplier: 1.1, type: 'packaging', packagingMaterial: 'Полистирол', packagingLetterCode: 'PS', packagingDigitalCode: '6' },
  ],
  group_20: [
    { value: 'g20_corrugated', label: 'Гофрокартон', code: '4819 10', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Гофрированный картон', packagingLetterCode: 'PAP', packagingDigitalCode: '20' },
    { value: 'g20_cardboard_boxes', label: 'Картонные коробки', code: '4819 20', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Картон прочий', packagingLetterCode: 'PAP', packagingDigitalCode: '21' },
    { value: 'g20_paper_bags', label: 'Бумажные мешки и пакеты', code: '4819 30', rateMultiplier: 0.9, type: 'packaging', packagingMaterial: 'Бумага', packagingLetterCode: 'PAP', packagingDigitalCode: '22' },
  ],
  group_21: [
    { value: 'g21_beverages', label: 'Упаковка для напитков', code: '4811 59', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Бумага/Картон + пластик + алюминий', packagingLetterCode: 'C/PAP', packagingDigitalCode: '84' },
    { value: 'g21_dairy', label: 'Упаковка для молочной продукции', code: '4811 59', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Бумага/Картон + пластик + алюминий', packagingLetterCode: 'C/PAP', packagingDigitalCode: '84' },
  ],
  group_22: [
    { value: 'g22_bottles', label: 'Стеклянные бутылки', code: '7010 90', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Стекло бесцветное', packagingLetterCode: 'GL', packagingDigitalCode: '70' },
    { value: 'g22_jars', label: 'Стеклянные банки', code: '7010 90', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Стекло зелёное/коричневое', packagingLetterCode: 'GL', packagingDigitalCode: '71' },
  ],
  group_23: [
    { value: 'g23_aluminum_cans', label: 'Алюминиевые банки', code: '7612 90', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Алюминий', packagingLetterCode: 'ALU', packagingDigitalCode: '41' },
    { value: 'g23_tin_cans', label: 'Жестяные банки', code: '7310 21', rateMultiplier: 0.9, type: 'packaging', packagingMaterial: 'Жесть (сталь)', packagingLetterCode: 'FE', packagingDigitalCode: '40' },
    { value: 'g23_metal_caps', label: 'Металлические крышки', code: '8309 90', rateMultiplier: 1.1, type: 'packaging', packagingMaterial: 'Сталь', packagingLetterCode: 'FE', packagingDigitalCode: '40' },
  ],
  group_24: [
    { value: 'g24_pallets', label: 'Деревянные поддоны', code: '4415 20', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Дерево натуральное', packagingLetterCode: 'FOR', packagingDigitalCode: '50' },
    { value: 'g24_crates', label: 'Деревянные ящики', code: '4415 10', rateMultiplier: 1.0, type: 'packaging', packagingMaterial: 'Дерево натуральное', packagingLetterCode: 'FOR', packagingDigitalCode: '50' },
  ],
}

// Группировка для отображения секций
export const productGroupSections = [
  { letter: 'А', title: 'Бумага и картон', from: 0, to: 2 },
  { letter: 'Б', title: 'Масла и шины', from: 2, to: 5 },
  { letter: 'В', title: 'Пластмассы и стекло', from: 5, to: 8 },
  { letter: 'Г', title: 'Электроника и оборудование', from: 8, to: 14 },
  { letter: 'Д', title: 'Бытовая техника и фильтры', from: 14, to: 18 },
  { letter: 'Е', title: 'Упаковка', from: 18, to: 24 },
]

/**
 * Получить товары из JSON-справочника по номеру группы
 */
export function getWasteGroupItems(groupId: number) {
  const group = wasteGroups.find(g => g.id === groupId)
  return group?.items || []
}

/**
 * Получить номер группы из value ключа (e.g. 'group_4' → 4)
 */
export function getGroupIdFromValue(value: string): number {
  const match = value.match(/group_(\d+)/)
  return match ? parseInt(match[1]) : 0
}

/**
 * Получить данные подгруппы по group и subgroup value
 */
export function getSubgroupData(groupValue: string, subgroupValue: string): ProductSubgroup | undefined {
  const subs = productSubgroups[groupValue]
  return subs?.find(s => s.value === subgroupValue)
}

/**
 * Найти подгруппу по group value и code (ТН ВЭД)
 */
export function getSubgroupByCode(groupValue: string, code: string): ProductSubgroup | undefined {
  const subs = productSubgroups[groupValue]
  return subs?.find(s => s.code === code)
}

/**
 * Определить, является ли группа упаковкой (группы 19-24)
 */
export function isPackagingGroup(groupValue: string): boolean {
  const num = getGroupIdFromValue(groupValue)
  return num >= 19 && num <= 24
}
