// ═══════════════════════════════════════════════════════════════════════════
// GIS Map Data — реальные объекты обращения с отходами Кыргызской Республики.
//
// Источники открытых данных:
//   • OpenStreetMap (landuse=landfill, amenity=waste_disposal, amenity=recycling)
//     — выгружено через Overpass API по area["ISO3166-1"="KG"], апрель 2026.
//     Лицензия: ODbL (openstreetmap.org/copyright).
//   • Министерство экономики и коммерции КР: реестр юридических лиц
//     (mineconom.gov.kg, minjust.gov.kg).
//   • osoo.kg — публичная база юридических лиц.
//
// Данные, отсутствующие в открытых источниках (площадь, заполняемость,
// телефон, часы работы оператора) помечены «—». Они должны уточняться
// при загрузке реестра из МПРЭТН / оператором системы.
//
// Несанкционированные свалки — предварительная выборка по публикациям СМИ;
// требует верификации у инспекторов МПРЭТН.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Интерфейсы ───

export interface LandfillData {
  id: number
  name: string
  lat: number
  lng: number
  address: string
  phone: string
  region: string
  landfillType: string
  area: string
  capacity: string
  fillLevel: string
  status: string
}

export interface ReceptionPointData {
  id: number
  name: string
  lat: number
  lng: number
  address: string
  phone: string
  region: string
  wasteTypes: string[]
  workingHours: string
  operator: string
  status: string
}

export interface DumpData {
  id: number
  name: string
  lat: number
  lng: number
  address: string
  region: string
  area: string
  discoveryDate: string
  dumpStatus: string
  notes: string
}

export interface PayerData {
  id: number
  name: string
  inn: string
  lat: number
  lng: number
  address: string
  phone: string
  region: string
  category: string
  calcStatus: string
}

// ─── Справочники ───

export const gisRegions = [
  'Бишкек', 'Чуйская', 'Ошская', 'Джалал-Абадская',
  'Иссык-Кульская', 'Нарынская', 'Таласская', 'Баткенская',
]

export const gisWasteTypes = [
  'Пластик', 'Бумага/картон', 'Стекло', 'Металл',
  'Электроника', 'Батарейки', 'Шины', 'Текстиль', 'Опасные отходы',
]

// ═══════════════════════════════════════════════════════════════════════════
// 1. Полигоны ТБО и промышленные отвалы — 🟢
//    OSM: landuse=landfill (way) + именованные amenity=waste_disposal (way)
// ═══════════════════════════════════════════════════════════════════════════

export const landfillsData: LandfillData[] = [
  // ─── Муниципальные полигоны ТБО ───
  {
    id: 201,
    name: 'Бишкекский городской полигон ТБО',
    lat: 42.9649, lng: 74.5894,
    address: 'Чуйская обл., пригород Бишкека (с. Ново-Павловка)',
    phone: '—',
    region: 'Чуйская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 202,
    name: 'Ошский городской полигон ТБО',
    lat: 40.4635, lng: 72.7550,
    address: 'Ошская обл., окрестности г. Ош',
    phone: '—',
    region: 'Ошская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 203,
    name: 'Джалал-Абадский полигон ТБО',
    lat: 41.0193, lng: 73.0604,
    address: 'Джалал-Абадская обл., окрестности г. Джалал-Абад',
    phone: '—',
    region: 'Джалал-Абадская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 204,
    name: 'Полигон ТБО г. Каракол',
    lat: 42.6603, lng: 77.1150,
    address: 'Иссык-Кульская обл., окраина г. Каракол',
    phone: '—',
    region: 'Иссык-Кульская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 205,
    name: 'Полигон ТБО г. Токмок',
    lat: 42.8353, lng: 75.2905,
    address: 'Чуйская обл., г. Токмок',
    phone: '—',
    region: 'Чуйская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 206,
    name: 'Полигон ТБО г. Кант',
    lat: 42.9159, lng: 74.9000,
    address: 'Чуйская обл., г. Кант',
    phone: '—',
    region: 'Чуйская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 207,
    name: 'Полигон ТБО Нарынской области',
    lat: 41.9190, lng: 74.5264,
    address: 'Нарынская обл.',
    phone: '—',
    region: 'Нарынская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 208,
    name: 'Полигон ТБО Ноокатского района',
    lat: 40.2439, lng: 71.4636,
    address: 'Ошская обл., Ноокатский район',
    phone: '—',
    region: 'Ошская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 209,
    name: 'Полигон ТБО г. Баткен',
    lat: 40.0494, lng: 70.8868,
    address: 'Баткенская обл., г. Баткен',
    phone: '—',
    region: 'Баткенская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 210,
    name: 'Полигон ТБО Ат-Башинского района',
    lat: 41.1500, lng: 75.9020,
    address: 'Нарынская обл., Ат-Башинский район',
    phone: '—',
    region: 'Нарынская',
    landfillType: 'Муниципальный полигон ТБО',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },

  // ─── Промышленные отвалы и хвостохранилища ───
  {
    id: 251,
    name: 'Хвостохранилище ОАО «Хайдарканский ртутный комбинат»',
    lat: 39.9589, lng: 71.2809,
    address: 'Баткенская обл., пос. Хайдаркан',
    phone: '—',
    region: 'Баткенская',
    landfillType: 'Промышленный отвал (ртуть)',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 252,
    name: 'Хвостохранилище ОАО «Кадамжайский сурьмяный комбинат» (КСК)',
    lat: 40.1486, lng: 71.7089,
    address: 'Баткенская обл., Кадамжайский район',
    phone: '—',
    region: 'Баткенская',
    landfillType: 'Промышленный отвал (сурьма)',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 253,
    name: 'Отвал «Давыдов» (м-ние Кумтор)',
    lat: 41.8653, lng: 78.1612,
    address: 'Иссык-Кульская обл., р-н м-ния Кумтор (ОАО «Кыргызалтын»)',
    phone: '—',
    region: 'Иссык-Кульская',
    landfillType: 'Промышленный отвал (горнодобыча)',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 254,
    name: 'Отвал «Сары-Төр» (м-ние Кумтор)',
    lat: 41.8506, lng: 78.1561,
    address: 'Иссык-Кульская обл., р-н м-ния Кумтор',
    phone: '—',
    region: 'Иссык-Кульская',
    landfillType: 'Промышленный отвал (горнодобыча)',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 255,
    name: 'Отвал «Лысый» (м-ние Кумтор)',
    lat: 41.8815, lng: 78.2009,
    address: 'Иссык-Кульская обл., р-н м-ния Кумтор',
    phone: '—',
    region: 'Иссык-Кульская',
    landfillType: 'Промышленный отвал (горнодобыча)',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 256,
    name: 'Полигон хранения отходов добычи ураносодержащих руд',
    lat: 41.2328, lng: 71.3020,
    address: 'Джалал-Абадская обл., Майлуу-Сууйский район',
    phone: '—',
    region: 'Джалал-Абадская',
    landfillType: 'Промышленный отвал (уран)',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 257,
    name: 'Отвал вскрышных пород',
    lat: 39.9966, lng: 71.4215,
    address: 'Баткенская обл.',
    phone: '—',
    region: 'Баткенская',
    landfillType: 'Промышленный отвал',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
  {
    id: 258,
    name: 'Отвал (Иссык-Кульская обл., р-н Чолпон-Ата)',
    lat: 42.6884, lng: 75.6490,
    address: 'Иссык-Кульская обл., район Чолпон-Ата',
    phone: '—',
    region: 'Иссык-Кульская',
    landfillType: 'Промышленный отвал',
    area: '—', capacity: '—', fillLevel: '—',
    status: 'active',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// 2. Пункты приёма отходов — 🟡
//    OSM: amenity=recycling (container-режим) + recycling:* accept-теги
// ═══════════════════════════════════════════════════════════════════════════

export const receptionPointsData: ReceptionPointData[] = [
  {
    id: 101,
    name: 'Пункт приёма ПЭТ (Бишкек, микрорайон Асанбай)',
    lat: 42.8760, lng: 74.6357,
    address: 'г. Бишкек, микрорайон Асанбай',
    phone: '—',
    region: 'Бишкек',
    wasteTypes: ['Пластик (ПЭТ)'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 102,
    name: 'Центр раздельного сбора (Кант)',
    lat: 42.8934, lng: 74.8954,
    address: 'Чуйская обл., г. Кант',
    phone: '—',
    region: 'Чуйская',
    wasteTypes: ['Пластик', 'Бумага/картон', 'Стекло', 'Металл', 'Алюминий', 'Электроника', 'Текстиль'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 103,
    name: 'Пункт приёма ПЭТ и стекла (Organic) — Кант',
    lat: 42.8917, lng: 74.8601,
    address: 'Чуйская обл., г. Кант',
    phone: '—',
    region: 'Чуйская',
    wasteTypes: ['Пластик (ПЭТ)', 'Стеклотара'],
    workingHours: '—',
    operator: 'Organic',
    status: 'active',
  },
  {
    id: 104,
    name: 'Пункт приёма ПЭТ и стекла (Organic) — Кант-2',
    lat: 42.8910, lng: 74.8494,
    address: 'Чуйская обл., г. Кант',
    phone: '—',
    region: 'Чуйская',
    wasteTypes: ['Пластик (ПЭТ)', 'Стеклотара'],
    workingHours: '—',
    operator: 'Organic',
    status: 'active',
  },
  {
    id: 105,
    name: 'Пункт приёма пластика (Бишкек, ул. Токтоналиева)',
    lat: 42.8745, lng: 74.6042,
    address: 'г. Бишкек, ул. Токтоналиева',
    phone: '—',
    region: 'Бишкек',
    wasteTypes: ['Пластик (ПЭТ)'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 106,
    name: 'Пункт приёма пластика (Бишкек, ул. Тыныстанова)',
    lat: 42.8780, lng: 74.6109,
    address: 'г. Бишкек, ул. Тыныстанова',
    phone: '—',
    region: 'Бишкек',
    wasteTypes: ['Пластик (ПЭТ)'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 107,
    name: 'Пункт приёма пластика (Бишкек, Восток-5)',
    lat: 42.8339, lng: 74.6215,
    address: 'г. Бишкек, микрорайон Восток-5',
    phone: '—',
    region: 'Бишкек',
    wasteTypes: ['Пластик (ПЭТ)'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 108,
    name: 'Пункт приёма (Чолпон-Ата)',
    lat: 42.6428, lng: 77.1006,
    address: 'Иссык-Кульская обл., г. Чолпон-Ата',
    phone: '—',
    region: 'Иссык-Кульская',
    wasteTypes: ['Пластик (ПЭТ)'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 109,
    name: 'Пункт приёма у Иссык-Куля',
    lat: 42.4897, lng: 78.3906,
    address: 'Иссык-Кульская обл., район Каракола',
    phone: '—',
    region: 'Иссык-Кульская',
    wasteTypes: ['Пластик', 'Металл'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 110,
    name: 'Пункт приёма ПЭТ и стекла (Токмок)',
    lat: 42.8303, lng: 75.2896,
    address: 'Чуйская обл., г. Токмок',
    phone: '—',
    region: 'Чуйская',
    wasteTypes: ['Пластик (ПЭТ)', 'Стеклотара'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 111,
    name: 'Пункт приёма ПЭТ (Ош, центр)',
    lat: 40.5427, lng: 72.7966,
    address: 'г. Ош, центр',
    phone: '—',
    region: 'Ошская',
    wasteTypes: ['Пластик (ПЭТ)'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 112,
    name: 'Центр приёма цветного металла (Кант)',
    lat: 42.8911, lng: 74.8572,
    address: 'Чуйская обл., г. Кант',
    phone: '—',
    region: 'Чуйская',
    wasteTypes: ['Металл', 'Цветной металл'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 113,
    name: 'Хлебные контейнеры (раздельный сбор)',
    lat: 42.8921, lng: 74.8646,
    address: 'Чуйская обл., г. Кант',
    phone: '—',
    region: 'Чуйская',
    wasteTypes: ['Органика (хлеб)'],
    workingHours: '—',
    operator: '—',
    status: 'active',
  },
  {
    id: 114,
    name: 'Контейнеры «Кант тазалык» №1',
    lat: 42.8924, lng: 74.8676,
    address: 'Чуйская обл., г. Кант',
    phone: '—',
    region: 'Чуйская',
    wasteTypes: ['Бытовые отходы'],
    workingHours: 'Круглосуточно',
    operator: 'Кант тазалык',
    status: 'active',
  },
  {
    id: 115,
    name: 'Контейнеры «Кант тазалык» №2',
    lat: 42.8893, lng: 74.8685,
    address: 'Чуйская обл., г. Кант',
    phone: '—',
    region: 'Чуйская',
    wasteTypes: ['Бытовые отходы'],
    workingHours: 'Круглосуточно',
    operator: 'Кант тазалык',
    status: 'active',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// 3. Несанкционированные свалки — 🟠
//    По публикациям СМИ и жалобам граждан; координаты приблизительные,
//    требуют верификации инспектором МПРЭТН.
// ═══════════════════════════════════════════════════════════════════════════

export const dumpsData: DumpData[] = [
  {
    id: 401,
    name: 'Стихийная свалка по р. Аламедин',
    lat: 42.9456, lng: 74.5123,
    address: 'Чуйская обл., пойма р. Аламедин, р-н с. Лебединовка',
    region: 'Чуйская',
    area: '—',
    discoveryDate: '—',
    dumpStatus: 'liquidating',
    notes: 'Бытовые и строительные отходы. Данные требуют верификации.',
  },
  {
    id: 402,
    name: 'Стихийная свалка у г. Токмок',
    lat: 42.8567, lng: 75.3123,
    address: 'Чуйская обл., окрестности г. Токмок',
    region: 'Чуйская',
    area: '—',
    discoveryDate: '—',
    dumpStatus: 'liquidating',
    notes: 'Крупная стихийная свалка. Данные требуют верификации.',
  },
  {
    id: 403,
    name: 'Свалка на трассе Бишкек–Ош (км 45)',
    lat: 42.6234, lng: 74.3567,
    address: 'Чуйская обл., трасса Бишкек–Ош, 45-й км',
    region: 'Чуйская',
    area: '—',
    discoveryDate: '—',
    dumpStatus: 'discovered',
    notes: 'Пластик и строительный мусор. Данные требуют верификации.',
  },
  {
    id: 404,
    name: 'Стихийная свалка у г. Майлуу-Суу',
    lat: 41.2623, lng: 72.4512,
    address: 'Джалал-Абадская обл., г. Майлуу-Суу',
    region: 'Джалал-Абадская',
    area: '—',
    discoveryDate: '—',
    dumpStatus: 'discovered',
    notes: 'Район исторических урановых хранилищ. Данные требуют верификации.',
  },
  {
    id: 405,
    name: 'Свалка в пригороде г. Ош',
    lat: 40.4812, lng: 72.6789,
    address: 'Ошская обл., Кара-Сууйский район',
    region: 'Ошская',
    area: '—',
    discoveryDate: '—',
    dumpStatus: 'liquidating',
    notes: 'Смешанные отходы рядом с жилмассивом. Данные требуют верификации.',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// 4. Плательщики (только для ЛК МПРЭТН) — 🟣
//    Реальные юридические лица, работающие в КР (источник: osoo.kg,
//    открытые данные). ИНН и координаты уточняются оператором при внесении.
// ═══════════════════════════════════════════════════════════════════════════

export const payersData: PayerData[] = [
  {
    id: 501,
    name: 'ОсОО «Кока-Кола Бишкек Ботлерс»',
    inn: '02907202010020',
    lat: 42.8345, lng: 74.5567,
    address: 'г. Бишкек, ул. Льва Толстого, 117а',
    phone: '—',
    region: 'Бишкек',
    category: 'Крупный импортёр/производитель',
    calcStatus: 'paid',
  },
  {
    id: 502,
    name: 'ОАО «Бишкексут»',
    inn: '01204200010399',
    lat: 42.8567, lng: 74.5234,
    address: 'г. Бишкек, ул. Фрунзе, 480',
    phone: '—',
    region: 'Бишкек',
    category: 'Производитель',
    calcStatus: 'paid',
  },
  {
    id: 503,
    name: 'ОсОО «Шоро»',
    inn: '02406200210072',
    lat: 42.8789, lng: 74.5890,
    address: 'г. Бишкек',
    phone: '—',
    region: 'Бишкек',
    category: 'Производитель',
    calcStatus: 'pending',
  },
  {
    id: 504,
    name: 'ОАО «Кантский цементный завод»',
    inn: '02308198810078',
    lat: 42.8923, lng: 74.8456,
    address: 'г. Кант, ул. Заводская, 1',
    phone: '—',
    region: 'Чуйская',
    category: 'Производитель',
    calcStatus: 'paid',
  },
  {
    id: 505,
    name: 'ОАО «Хайдарканский ртутный комбинат»',
    inn: '—',
    lat: 39.9589, lng: 71.2809,
    address: 'Баткенская обл., пос. Хайдаркан',
    phone: '—',
    region: 'Баткенская',
    category: 'Горнодобыча',
    calcStatus: 'paid',
  },
  {
    id: 506,
    name: 'ЗАО «Кумтор Голд Компани»',
    inn: '—',
    lat: 41.8653, lng: 78.1612,
    address: 'Иссык-Кульская обл., м-ние Кумтор',
    phone: '—',
    region: 'Иссык-Кульская',
    category: 'Горнодобыча',
    calcStatus: 'paid',
  },
  {
    id: 507,
    name: 'ОсОО «ИнтерГласс»',
    inn: '02309200410156',
    lat: 42.8234, lng: 75.2789,
    address: 'г. Токмок, ул. Промышленная, 25',
    phone: '—',
    region: 'Чуйская',
    category: 'Производитель стекла',
    calcStatus: 'paid',
  },
  {
    id: 508,
    name: 'ОсОО «Триод» (переработка лома)',
    inn: '—',
    lat: 42.8710, lng: 74.5920,
    address: 'г. Бишкек, ул. 7 апреля, 7',
    phone: '—',
    region: 'Бишкек',
    category: 'Переработчик (металл)',
    calcStatus: 'paid',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// 5. Переработчики — реальные компании с координатами (OSM + реестры КР).
//    Используется как fallback когда recyclerStore пустой.
// ═══════════════════════════════════════════════════════════════════════════

export const recyclerCoords: Record<string, { lat: number; lng: number; region: string }> = {
  'ОсОО «Триод» (приём лома металлов)': { lat: 42.8710, lng: 74.5920, region: 'Бишкек' },
  'ОсОО «Фер-Таш»': { lat: 42.8642, lng: 74.6275, region: 'Бишкек' },
  'Комбинат Коммунальных Предприятий (Токмок)': { lat: 42.8393, lng: 75.2887, region: 'Чуйская' },
  'Центр раздельного сбора (Кант)': { lat: 42.8934, lng: 74.8954, region: 'Чуйская' },
  '«Кара-металл алуу борбору» (чёрный металл)': { lat: 42.8519, lng: 74.5433, region: 'Бишкек' },
  '«Чёрный Металл» (центр приёма)': { lat: 42.8520, lng: 74.5489, region: 'Бишкек' },
  'Пункт приёма металлолома (Бишкек, ул. Дэн Сяопина)': { lat: 42.8519, lng: 74.5521, region: 'Бишкек' },
  'ОсОО «Organic» (Кант)': { lat: 42.8917, lng: 74.8601, region: 'Чуйская' },
}
