/**
 * translate-html-instructions.mjs
 *
 * Translates the two large HTML instruction blocks (instructionCalc.html, instructionReport.html)
 * and generates dict-supplement8.mjs with exact-match entries.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT = resolve(__dirname, '../src/locales/ru.json');
const ru = JSON.parse(readFileSync(INPUT, 'utf-8'));

// Get both HTML blocks
const calcHtml = ru.instructionCalc?.html || '';
const reportHtml = ru.instructionReport?.html || '';

// Granular translation map - smaller fragments that work across both instructions
// Order matters: longer phrases first to avoid partial replacements
const htmlTranslations = [
  // Headers and titles
  ["Инструкция по заполнению формы расчёта суммы утилизационного сбора", "Instructions for Filling Out the Recycling Fee Calculation Form"],
  ["Инструкция по заполнению формы отчётности", "Instructions for Filling Out the Reporting Form"],
  ["для производителей и импортёров", "for producers and importers"],

  // Long paragraphs - calc
  ["Указывается порядковый номер.", "The sequential number is indicated."],
  ["Указывается номер группы готовых товаров и их упаковки, выпущенных в обращение на территории Кыргызской Республики. Номер и наименования приводятся в соответствии с перечнем, утверждённым", "The group number of finished goods and their packaging released into circulation in the Kyrgyz Republic is indicated. Numbers and names are provided in accordance with the list approved by"],
  ["Коды товаров и упаковки указываются по Государственному статистическому классификатору продукции (ГСКП).", "Product and packaging codes are indicated according to the State Statistical Classifier of Products (SCCP)."],
  ["Код по каждому готовому товару (упаковке) указывается по единой Товарной номенклатуре внешнеэкономической деятельности Евразийского экономического союза ТН ВЭД.", "The code for each finished product (packaging) is indicated according to the unified Commodity Nomenclature of Foreign Economic Activity of the Eurasian Economic Union (HS Code)."],
  ["Заполняется на основании данных бухгалтерского и финансового учёта, а также инвойсов и иных подтверждающих документов, содержащих сведения об общем объёме готовой продукции и упаковки, выпущенных в обращение на территории Кыргызской Республики за отчётный период.", "Filled in based on accounting and financial records, as well as invoices and other supporting documents containing information about the total volume of finished products and packaging released into circulation in the Kyrgyz Republic during the reporting period."],
  ["Указываются нормативы переработки отходов от использования товаров, утверждённые", "Waste recycling standards for product use are indicated, as approved by"],
  ["Указывается итоговое количество товаров (готовой продукции и упаковки), подлежащих переработке, с учётом норматива переработки.", "The total quantity of goods (finished products and packaging) subject to recycling is indicated, taking into account the recycling standard."],
  ["Указывается количество отходов от использования товаров (готовой продукции и упаковки), фактически переданных либо планируемых к передаче на переработку в отчётном периоде в соответствии с заключённым договором с лицензированным переработчиком отходов.", "The quantity of waste from product use (finished products and packaging) actually transferred or planned for transfer to recycling in the reporting period in accordance with the agreement with a licensed waste recycler is indicated."],
  ["При ввозе товаров и при отсутствии фактической передачи отходов в отчётном периоде в графе указывается значение", "When importing goods and in the absence of actual waste transfer in the reporting period, the value entered in the column is"],
  ["Фактическая передача отходов подтверждается договором и, при наличии, актами приёма-передачи и отражается в отчётности за период, в котором такая передача осуществлена.", "Actual waste transfer is confirmed by a contract and, if available, acceptance-transfer acts, and is reflected in the report for the period in which such transfer was carried out."],
  ["Указывается количество товаров и упаковки, вывезенных за пределы территории Кыргызской Республики. Для заполнения используются данные таможенных документов, а при их отсутствии — документы, предоставленные контрагентами в рамках коммерческой деятельности.", "The quantity of goods and packaging exported beyond the territory of the Kyrgyz Republic is indicated. Customs documents data is used for filling, and in their absence — documents provided by counterparties in the course of commercial activities."],
  ["При отсутствии подтверждающих документов о фактическом вывозе в графе указывается значение", "In the absence of supporting documents on actual export, the value entered in the column is"],
  ["Указывается разность между установленными данными (графа 7) и фактически переработанным количеством (графа 8), а также вывозом (графа 9).", "The difference between the established data (column 7) and actually recycled quantity (column 8), as well as export (column 9) is indicated."],
  ["Заполняется в соответствии со ставками утилизационного сбора, установленными в", "Filled in according to the recycling fee rates established in"],
  ["Заполняется на основании данных о фактически начисленных и произведённых платежах за отчётный период:", "Filled in based on data on actually accrued and made payments for the reporting period:"],
  ["Показатели указываются с точностью до двух знаков после запятой и используются для определения наличия переплаты либо недоимки по утилизационному сбору.", "Indicators are specified with precision to two decimal places and are used to determine the presence of overpayment or arrears on the recycling fee."],

  // Long paragraphs - report
  ["В позициях отчётности, не подлежащих заполнению, ставится прочерк. Отчётность на бумажном носителе подписывается руководителем юридического лица или лицом, уполномоченным на осуществление действий от имени юридического лица либо индивидуальным предпринимателем или физическим лицом, прошивается, нумеруется постранично и скрепляется печатью (при наличии).", "A dash is placed in reporting positions that are not subject to filling. Paper-based reports are signed by the head of the legal entity or a person authorized to act on behalf of the legal entity or an individual entrepreneur or individual, stitched, numbered page by page, and sealed (if available)."],
  ["Заполняется для товаров, выпущенных в обращение на территории Кыргызской Республики, в том числе для упаковки как готового товара.", "Filled in for goods released into circulation in the Kyrgyz Republic, including packaging as a finished product."],
  ["Информация об упаковке товаров в данную таблицу не включается.", "Information about product packaging is not included in this table."],
  ["Таблица заполняется следующим образом: вначале указывается номер и наименование группы товаров в соответствии с разделом 1 перечня, а затем построчно указываются товарные позиции. В таблицу включаются только те группы товаров, в отношении которых возникает обязанность по обеспечению переработки отходов.", "The table is filled in as follows: first, the number and name of the product group is indicated in accordance with section 1 of the list, and then product items are indicated line by line. Only those product groups for which there is an obligation to ensure waste recycling are included in the table."],
  ["Наименования товаров приводятся по", "Product names are provided according to"],
  ["Государственному статистическому классификатору продукции (товаров и услуг) ГК 017-2015", "State Statistical Classifier of Products (goods and services) SC 017-2015"],
  ["в соответствии с первой графой раздела 2 перечня.", "in accordance with the first column of section 2 of the list."],
  ["Заполняется для товаров, в том числе упаковки как готового товара, выпущенных в обращение на территории КР их", "Filled in for goods, including packaging as a finished product, released into circulation in the KR by their"],
  ["Наименование и код по каждому товару указываются по единой Товарной номенклатуре внешнеэкономической деятельности Евразийского экономического союза (ТН ВЭД ЕАЭС), утверждённой", "The name and code for each product are indicated according to the unified Commodity Nomenclature of Foreign Economic Activity of the Eurasian Economic Union (HS Code EAEU), approved by"],
  ["решением Совета ЕЭК от 14 сентября 2021 года № 80", "EEC Council Decision No. 80 dated September 14, 2021"],
  ["Заполняется для товаров, выпущенных в обращение их", "Filled in for goods released into circulation by their"],
  [". Юридическое лицо, являющееся одновременно производителем и импортёром, заполняет графы 3–5.", ". A legal entity that is both a producer and an importer fills in columns 3–5."],
  ["Количество товаров, упаковки товаров, количество отходов указываются для каждого товара в", "The quantity of goods, product packaging, and waste quantity are indicated for each product in"],
  [", округлённых до целого числа по математическим правилам округления.", ", rounded to a whole number according to mathematical rounding rules."],
  ["Заполняется на основе информации, полученной при декларировании производителями и импортёрами количества выпущенных в обращение товаров, упаковки товаров. Используется информация из декларации за текущий отчётный год.", "Filled in based on information obtained during declaration by producers and importers of the quantity of goods and product packaging released into circulation. Information from the declaration for the current reporting year is used."],
  ["Указывается количество товаров, выпущенных в обращение в текущем отчётном году, в отношении которых возникает обязанность обеспечивать выполнение нормативов переработки на основе информации из декларации.", "The quantity of goods released into circulation in the current reporting year for which there is an obligation to ensure compliance with recycling standards based on declaration information is indicated."],
  ["Количество отходов от использования товаров, собранных на территории КР и переработанных в отчётный период, указывается на основании сведений, содержащихся в", "The quantity of waste from product use collected in the KR and recycled during the reporting period is indicated based on information contained in"],
  ["актах переработки отходов", "waste recycling acts"],
  ["Количество отходов, переработанных в предыдущий отчётный период сверх норматива переработки, указывается на основании сведений, содержащихся в отчётности за предыдущий отчётный период.", "The quantity of waste recycled in the previous reporting period above the recycling standard is indicated based on information contained in the report for the previous reporting period."],
  ["Итоговое количество отходов, засчитываемых в отчётный период, определяется путём суммирования:", "The total quantity of waste credited in the reporting period is determined by summing:"],
  ["Количество отходов, за которые необходимо уплатить утилизационный сбор, определяется путём вычитания из итогового количества товаров, подлежащих переработке, итогового количества переработанных отходов.", "The quantity of waste for which the recycling fee must be paid is determined by subtracting the total quantity of recycled waste from the total quantity of goods subject to recycling."],
  ["Заполняется в случае невыполнения нормативов переработки.", "Filled in in case of non-compliance with recycling standards."],
  ["Приводятся следующие сведения:", "The following information is provided:"],
  ["При организации", "When organizing"],
  ["собственных объектов", "own facilities"],
  ["по переработке — реквизиты (номер, дата) актов переработки отходов", "for recycling — details (number, date) of waste recycling acts"],
  ["При заключении", "When entering into"],
  ["договоров с переработчиками", "contracts with recyclers"],
  ["— наименование лица, осуществляющего переработку, реквизиты договоров и актов переработки отходов", "— the name of the entity performing recycling, details of contracts and waste recycling acts"],
  ["Если обеспечение нормативов осуществлялось через", "If compliance with standards was ensured through"],
  ["нескольких переработчиков", "multiple recyclers"],
  ["— указывается каждое лицо (в виде нескольких строк для одного товара)", "— each entity is indicated (as multiple rows for one product)"],
  ["Заполняется в обязательном порядке в случае, если норматив переработки выполняется за счёт переработки", "Filled in mandatorily if the recycling standard is met through the recycling of"],
  ["взаимозаменяемых товаров и упаковки", "interchangeable goods and packaging"],
  ["(аналогичного назначения и/или аналогичного способа переработки).", "(of similar purpose and/or similar recycling method)."],
  ["В графе даются пояснения, позволяющие соотнести товар, подлежащий переработке, с переработанными взаимозаменяемыми товарами. В иных случаях графа заполняется на усмотрение производителя/импортёра.", "The column provides explanations allowing to correlate the product subject to recycling with recycled interchangeable goods. In other cases, the column is filled at the discretion of the producer/importer."],
  ["В таблицу включается информация об упаковке товаров", "The table includes information about product packaging"],
  ["(за исключением упаковки как готового товара)", "(excluding packaging as a finished product)"],
  ["Заполняется следующим образом: вначале указывается номер группы упаковки товаров в соответствии с разделом 2 перечня, а затем построчно указываются позиции по упаковке, материалу, из которого сделана упаковка.", "Filled in as follows: first, the product packaging group number is indicated in accordance with section 2 of the list, and then packaging positions are indicated line by line by the material from which the packaging is made."],
  ["Заполняется при наличии возможности идентифицировать упаковку товаров по одной из указанных классификаций (буквенный и цифровой код).", "Filled in when it is possible to identify product packaging according to one of the specified classifications (alphabetic and numeric code)."],
  ["Итоговое количество отходов от использования товаров (в части упаковки), засчитываемых в отчётный период, определяется путём суммирования количества отходов, переработанных в текущий период, и количества отходов, переработанных в предыдущий период сверх норматива.", "The total quantity of waste from product use (in terms of packaging) credited in the reporting period is determined by summing the quantity of waste recycled in the current period and the quantity of waste recycled in the previous period above the standard."],
  ["Количество отходов (в части упаковки), за которые необходимо уплатить утилизационный сбор, определяется путём вычитания из итогового количества упаковки, подлежащей переработке, итогового количества переработанных отходов.", "The quantity of waste (in terms of packaging) for which the recycling fee must be paid is determined by subtracting the total quantity of recycled waste from the total quantity of packaging subject to recycling."],
  ["Заполняется в случае невыполнения нормативов переработки (в части упаковки товаров).", "Filled in in case of non-compliance with recycling standards (in terms of product packaging)."],

  // Legal references
  ["постановлением Кабинета Министров № 322 от 19.06.2024", "Cabinet of Ministers Resolution No. 322 dated 06/19/2024"],
  ["постановлением Кабинета Министров КР № 322 от 19 июня 2024 года", "Cabinet of Ministers of the KR Resolution No. 322 dated June 19, 2024"],
  ["приложении 2 к постановлению Кабинета Министров КР № 730 от 3 декабря 2024 года", "Appendix 2 to the Cabinet of Ministers of the KR Resolution No. 730 dated December 3, 2024"],
  ["в соответствии с п. 13 приложения 1 к постановлению № 730 от 3 декабря 2024 года", "in accordance with clause 13 of Appendix 1 to Resolution No. 730 dated December 3, 2024"],
  ["в соответствии с п. 15 приложения 1 к постановлению № 730 от 3 декабря 2024 года", "in accordance with clause 15 of Appendix 1 to Resolution No. 730 dated December 3, 2024"],

  // Column headers (Графа N — Name)
  ["Графа 14–15", "Columns 14–15"],
  ["Графа 10", "Column 10"],
  ["Графа 11", "Column 11"],
  ["Графа 12", "Column 12"],
  ["Графа 13", "Column 13"],
  ["Графа 16", "Column 16"],
  ["Графа 17", "Column 17"],
  ["Графа 1", "Column 1"],
  ["Графа 2", "Column 2"],
  ["Графа 3", "Column 3"],
  ["Графа 4", "Column 4"],
  ["Графа 5", "Column 5"],
  ["Графа 6", "Column 6"],
  ["Графа 7", "Column 7"],
  ["Графа 8", "Column 8"],
  ["Графа 9", "Column 9"],

  // Section headings
  ["Общие правила", "General Rules"],
  ["Таблица 1 — Товары", "Table 1 — Products"],
  ["Таблица 2 — Упаковка товаров", "Table 2 — Product Packaging"],
  ["— ГСКП", "— SCCP"],
  ["— ТН ВЭД", "— HS Code"],
  ["— Единицы измерения", "— Units of Measurement"],
  ["— Количество", "— Quantity"],
  ["— К переработке", "— For Recycling"],
  ["— Переработано", "— Recycled"],
  ["— Сверх норматива (за прошлый период)", "— Above Standard (for the previous period)"],
  ["— Итого переработано (упаковка)", "— Total Recycled (packaging)"],
  ["— Итого переработано", "— Total Recycled"],
  ["— К уплате (упаковка)", "— For Payment (packaging)"],
  ["— К уплате", "— For Payment"],
  ["— Документы о переработке", "— Recycling Documents"],
  ["— Примечания", "— Notes"],
  ["— Классификация упаковки", "— Packaging Classification"],

  // Shorter phrases for calc
  ["Для производителей и импортёров, не обеспечивающих самостоятельную переработку:", "For producers and importers who do not provide independent recycling:"],
  ["Для производителей и импортёров, обеспечивающих самостоятельную переработку и/или осуществивших вывоз:", "For producers and importers who provide independent recycling and/or carried out export:"],
  ["Заполняется производителями.", "Filled in by producers."],
  ["Импортёрами не заполняется.", "Not filled in by importers."],
  ["Производителями не заполняется.", "Not filled in by producers."],
  ["Показатели отражаются в тоннах.", "Indicators are reflected in tons."],
  ["Показатели указываются в тоннах.", "Indicators are indicated in tons."],
  ["Полученный результат указывается в тоннах.", "The result is indicated in tons."],

  // Short keywords and labels
  ["производителями", "producers"],
  ["импортёрами", "importers"],
  ["Производители", "Producers"],
  ["Импортёры", "Importers"],
  ["килограммах", "kilograms"],

  // List items for calc
  ["— по суммам ежеквартальных платежей", "— based on quarterly payment amounts"],
  ["— по суммам платежей, исчисленных при фактическом ввозе товаров и упаковки на территорию КР, 15 рабочих дней с момента ввоза", "— based on payment amounts calculated upon actual import of goods and packaging into the KR territory, 15 business days from the date of import"],
];

function translateHtml(html) {
  let result = html;
  for (const [ru2, en] of htmlTranslations) {
    result = result.split(ru2).join(en);
  }
  return result;
}

const translatedCalc = translateHtml(calcHtml);
const translatedReport = translateHtml(reportHtml);

// Check if Russian characters remain
const hasRussianCalc = /[а-яё]/i.test(translatedCalc);
const hasRussianReport = /[а-яё]/i.test(translatedReport);

if (hasRussianCalc) {
  const matches = translatedCalc.match(/[а-яёА-ЯЁ][^<>]*[а-яёА-ЯЁ.!?,;:]/g);
  console.log('Remaining Russian in instructionCalc:', matches?.length, 'segments');
  matches?.forEach((m, i) => console.log(`  ${i + 1}. "${m.substring(0, 120)}"`));
}

if (hasRussianReport) {
  const matches = translatedReport.match(/[а-яёА-ЯЁ][^<>]*[а-яёА-ЯЁ.!?,;:]/g);
  console.log('Remaining Russian in instructionReport:', matches?.length, 'segments');
  matches?.forEach((m, i) => console.log(`  ${i + 1}. "${m.substring(0, 120)}"`));
}

if (!hasRussianCalc && !hasRussianReport) {
  console.log('Both HTML blocks fully translated!');
}

// Write dict-supplement8.mjs
const output = `/**
 * dict-supplement8.mjs — HTML instruction blocks translated
 */
export const supplementDict8 = {
  ${JSON.stringify(calcHtml)}: ${JSON.stringify(translatedCalc)},
  ${JSON.stringify(reportHtml)}: ${JSON.stringify(translatedReport)},
};
`;

writeFileSync(resolve(__dirname, 'dict-supplement8.mjs'), output, 'utf-8');
console.log('dict-supplement8.mjs written successfully.');
