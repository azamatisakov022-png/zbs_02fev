import { reactive } from 'vue'
import api from '../api/client'

// ═══ Types ═══

export type RecyclerStatus = 'active' | 'suspended' | 'revoked'
export type InspectionStatus = 'compliant' | 'violations' | 'reinspection_required'

export interface RecyclerCapacity {
  wasteType: string       // group value, e.g. 'group_6'
  capacityTons: number    // max capacity in tons/year
  currentLoadTons: number // current load in tons/year
}

export interface RecyclerDocument {
  name: string
  type: 'pdf' | 'jpg' | 'doc'
  size: string
  date: string
}

export interface Recycler {
  id: number
  // 66. Порядковый номер (= id)
  // 67. Полное наименование
  name: string
  fullName: string
  // 68. ОПФ
  opf: string
  // 69. ИНН
  inn: string
  // 70. Регион, адрес производственной площадки
  region: string
  address: string
  legalAddress: string
  actualAddress: string
  // 71. Руководитель организации
  directorName: string
  directorPosition: string
  // 72. Контактное лицо
  contactPerson: string | null
  contactPosition: string | null
  contactPhone: string
  contactEmail: string
  website: string
  // 73-75. Лицензия
  licenseNumber: string
  licenseDate: string
  licenseExpiry: string
  licenseAuthority: string
  licenseActivities: string[]
  // 76. Экологический паспорт
  ecoPassportNumber: string | null
  ecoPassportDate: string | null
  // 77. Виды отходов
  wasteTypes: string[]
  // 78. Мощности переработки (т/год)
  capacities: RecyclerCapacity[]
  // 79. Технологии переработки
  technologies: Record<string, string>
  // 80. Наличие оборудования
  equipment: string | null
  // 81. Площадь территории (м²)
  productionArea: number | null
  // 82. Количество сотрудников
  employeesCount: string
  // 83. Сертификаты качества
  certifications: string[]
  // 84. Статус проверки
  inspectionStatus: InspectionStatus | null
  // 85. Дата последней проверки
  lastInspectionDate: string | null
  // 86. Замечания проверки
  inspectionRemarks: string | null
  // 87. Дата следующей проверки
  nextInspectionDate: string | null
  // 88. Объём переработки за текущий год (т)
  processedCurrentYear: number
  // 89. Объём переработки за предыдущий год (т)
  processedPreviousYear: number
  // 90. Статус в реестре
  status: RecyclerStatus
  // 91. Причина приостановки/исключения
  suspensionReason: string | null
  // 92. Дата последнего обновления
  updatedAt: string
  // 93. Примечания
  notes: string | null
  // Мета
  addedDate: string
  addedBy: string
  // Допол. отображение
  coordinates: { lat: number; lng: number } | null
  documents: RecyclerDocument[]
  processingMethods: string[]
  rating: number
}

// ═══ Mock data ═══

const MPRETK = 'Министерство природных ресурсов, экологии и технического надзора КР'

let nextId = 9

const state = reactive<{ recyclers: Recycler[]; loading: boolean }>({
  loading: false,
  recyclers: [
    {
      id: 1, name: 'ОсОО «ЭкоРесайкл»', fullName: 'Общество с ограниченной ответственностью «ЭкоРесайкл»', opf: 'ОсОО', inn: '02301200910345',
      region: 'Бишкек', address: 'г. Бишкек, ул. Ибраимова, 42', legalAddress: 'г. Бишкек, ул. Ибраимова, 42', actualAddress: 'г. Бишкек, Промзона Восток, участок 15',
      directorName: 'Касымов Нурлан Бакытович', directorPosition: 'Директор',
      contactPerson: 'Аманова Жамиля Бактыгуловна', contactPosition: 'Менеджер по работе с клиентами',
      contactPhone: '+996 555 100 200', contactEmail: 'info@ecorecycle.kg', website: 'www.ecorecycle.kg',
      licenseNumber: 'ЛИЦ-2023-001', licenseDate: '15.03.2023', licenseExpiry: '15.03.2028',
      licenseAuthority: MPRETK, licenseActivities: ['Сбор и переработка полимерных отходов', 'Сбор и переработка бумажных отходов', 'Вторичная переработка пластиковой упаковки'],
      ecoPassportNumber: 'ЭП-2023-0156', ecoPassportDate: '20.04.2023',
      wasteTypes: ['group_6', 'group_7', 'group_19', 'group_1', 'group_2', 'group_20'],
      capacities: [
        { wasteType: 'group_6', capacityTons: 400, currentLoadTons: 285 },
        { wasteType: 'group_7', capacityTons: 300, currentLoadTons: 190 },
        { wasteType: 'group_19', capacityTons: 200, currentLoadTons: 95 },
        { wasteType: 'group_1', capacityTons: 50, currentLoadTons: 20 },
        { wasteType: 'group_2', capacityTons: 30, currentLoadTons: 15 },
        { wasteType: 'group_20', capacityTons: 20, currentLoadTons: 10 },
      ],
      technologies: { group_6: 'Механическая переработка (дробление, грануляция)', group_7: 'Термическая переработка', group_19: 'Экструзия вторичного полимера', group_1: 'Прессование и перегруппировка', group_2: 'Роспуск и прессование', group_20: 'Термическая переработка' },
      equipment: 'Дробилка SML-800, грануляционная линия KRG-500, экструдер PE-300',
      productionArea: 2500, employeesCount: '35', certifications: ['ISO 14001'], processingMethods: ['Механическая переработка', 'Грануляция', 'Экструзия'],
      inspectionStatus: 'compliant', lastInspectionDate: '20.11.2025', inspectionRemarks: null, nextInspectionDate: '20.05.2026',
      processedCurrentYear: 920, processedPreviousYear: 780,
      status: 'active', suspensionReason: null, updatedAt: '15.01.2026', notes: null,
      addedDate: '15.03.2023', addedBy: 'Мамытова А.',
      coordinates: { lat: 42.8746, lng: 74.5698 },
      documents: [
        { name: 'Лицензия ЛИЦ-2023-001', type: 'pdf', size: '2.4 МБ', date: '15.03.2023' },
        { name: 'Экологический паспорт ЭП-2023-0156', type: 'pdf', size: '1.8 МБ', date: '20.04.2023' },
        { name: 'Акт проверки №145', type: 'pdf', size: '1.1 МБ', date: '20.11.2025' },
        { name: 'Сертификат оборудования', type: 'pdf', size: '3.8 МБ', date: '01.02.2023' },
      ],
      rating: 4.8,
    },
    {
      id: 2, name: 'ОсОО «ГринТек»', fullName: 'Общество с ограниченной ответственностью «ГринТек»', opf: 'ОсОО', inn: '01508200810567',
      region: 'Бишкек', address: 'г. Бишкек, ул. Жибек Жолу, 114', legalAddress: 'г. Бишкек, ул. Жибек Жолу, 114', actualAddress: 'г. Бишкек, Промзона Запад, корпус 3',
      directorName: 'Ибраимова Айгуль Сапаровна', directorPosition: 'Генеральный директор',
      contactPerson: 'Токтогулова Нуржан Алмазовна', contactPosition: 'Начальник производства',
      contactPhone: '+996 555 300 400', contactEmail: 'office@greentech.kg', website: 'www.greentech.kg',
      licenseNumber: 'ЛИЦ-2023-015', licenseDate: '01.06.2023', licenseExpiry: '01.06.2028',
      licenseAuthority: MPRETK, licenseActivities: ['Переработка электронных отходов', 'Утилизация электрооборудования', 'Переработка бытовой техники'],
      ecoPassportNumber: 'ЭП-2023-0289', ecoPassportDate: '15.07.2023',
      wasteTypes: ['group_9', 'group_10', 'group_11', 'group_13', 'group_16'],
      capacities: [
        { wasteType: 'group_9', capacityTons: 80, currentLoadTons: 55 },
        { wasteType: 'group_10', capacityTons: 60, currentLoadTons: 40 },
        { wasteType: 'group_11', capacityTons: 80, currentLoadTons: 35 },
        { wasteType: 'group_13', capacityTons: 50, currentLoadTons: 20 },
        { wasteType: 'group_16', capacityTons: 30, currentLoadTons: 15 },
      ],
      technologies: { group_9: 'Демонтаж и сортировка', group_10: 'Плавление и рафинирование', group_11: 'Механическая переработка', group_13: 'Химическая нейтрализация', group_16: 'Сортировка и прессование' },
      equipment: 'Линия демонтажа электроники ED-200, плавильная печь MF-100, сортировочный конвейер SC-150',
      productionArea: 1800, employeesCount: '28', certifications: ['ISO 14001', 'ISO 9001'], processingMethods: ['Демонтаж', 'Сортировка', 'Плавление'],
      inspectionStatus: 'compliant', lastInspectionDate: '15.10.2025', inspectionRemarks: null, nextInspectionDate: '15.04.2026',
      processedCurrentYear: 680, processedPreviousYear: 540,
      status: 'active', suspensionReason: null, updatedAt: '10.01.2026', notes: null,
      addedDate: '01.06.2023', addedBy: 'Мамытова А.',
      coordinates: { lat: 42.8612, lng: 74.5889 },
      documents: [
        { name: 'Лицензия ЛИЦ-2023-015', type: 'pdf', size: '2.1 МБ', date: '01.06.2023' },
        { name: 'Экологический паспорт ЭП-2023-0289', type: 'pdf', size: '1.5 МБ', date: '15.07.2023' },
        { name: 'Акт проверки №203', type: 'pdf', size: '0.9 МБ', date: '15.10.2025' },
        { name: 'Сертификат ISO 14001', type: 'pdf', size: '1.5 МБ', date: '20.07.2023' },
      ],
      rating: 4.6,
    },
    {
      id: 3, name: 'ОсОО «ПластПром»', fullName: 'Общество с ограниченной ответственностью «ПластПром»', opf: 'ОсОО', inn: '02209200710234',
      region: 'Чуйская', address: 'г. Кара-Балта, ул. Промышленная, 5', legalAddress: 'г. Кара-Балта, ул. Промышленная, 5', actualAddress: 'г. Кара-Балта, Промзона, строение 5А',
      directorName: 'Чотбаев Алмаз Уланович', directorPosition: 'Директор',
      contactPerson: 'Медеров Кубаныч Саматович', contactPosition: 'Главный инженер',
      contactPhone: '+996 555 500 600', contactEmail: 'plastprom@mail.kg', website: '\u2014',
      licenseNumber: 'ЛИЦ-2022-089', licenseDate: '10.09.2022', licenseExpiry: '10.09.2027',
      licenseAuthority: MPRETK, licenseActivities: ['Сбор и переработка пластмассовых отходов', 'Глубокая переработка полимеров', 'Пиролиз пластиковых отходов'],
      ecoPassportNumber: null, ecoPassportDate: null,
      wasteTypes: ['group_6', 'group_7', 'group_19'],
      capacities: [
        { wasteType: 'group_6', capacityTons: 600, currentLoadTons: 520 },
        { wasteType: 'group_7', capacityTons: 400, currentLoadTons: 350 },
        { wasteType: 'group_19', capacityTons: 200, currentLoadTons: 130 },
      ],
      technologies: { group_6: 'Глубокая переработка (мойка, дробление, регрануляция)', group_7: 'Высокотемпературный пиролиз', group_19: 'Механическая переработка' },
      equipment: 'Линия мойки-дробления PW-1200, пиролизная установка PY-500, регранулятор RG-300',
      productionArea: 4200, employeesCount: '52', certifications: [], processingMethods: ['Глубокая переработка', 'Пиролиз', 'Регрануляция'],
      inspectionStatus: 'violations', lastInspectionDate: '05.08.2025',
      inspectionRemarks: 'Превышение ПДВ по мелкодисперсной пыли на 15%. Необходима замена фильтров вытяжной системы. Срок устранения — до 05.02.2026.',
      nextInspectionDate: '05.02.2026',
      processedCurrentYear: 1850, processedPreviousYear: 1620,
      status: 'active', suspensionReason: null, updatedAt: '08.01.2026', notes: 'Крупнейший переработчик пластика в Чуйской области',
      addedDate: '10.09.2022', addedBy: 'Асанов Б.',
      coordinates: { lat: 42.8158, lng: 73.8486 },
      documents: [
        { name: 'Лицензия ЛИЦ-2022-089', type: 'pdf', size: '2.0 МБ', date: '10.09.2022' },
        { name: 'Акт проверки №087', type: 'pdf', size: '1.3 МБ', date: '05.08.2025' },
        { name: 'Паспорт оборудования', type: 'pdf', size: '4.1 МБ', date: '10.09.2022' },
      ],
      rating: 4.2,
    },
    {
      id: 4, name: 'ОсОО «МеталлРесайкл»', fullName: 'Общество с ограниченной ответственностью «МеталлРесайкл»', opf: 'ОсОО', inn: '01705200610789',
      region: 'Бишкек', address: 'г. Бишкек, ул. Алма-Атинская, 78', legalAddress: 'г. Бишкек, ул. Алма-Атинская, 78', actualAddress: 'г. Бишкек, ул. Алма-Атинская, 78, цех 2',
      directorName: 'Бактыгулов Эрлан Жаныбекович', directorPosition: 'Директор',
      contactPerson: 'Салиева Жаркын Болотовна', contactPosition: 'Менеджер по логистике',
      contactPhone: '+996 555 700 800', contactEmail: 'info@metalrecycle.kg', website: 'www.metalrecycle.kg',
      licenseNumber: 'ЛИЦ-2023-034', licenseDate: '20.04.2023', licenseExpiry: '20.04.2028',
      licenseAuthority: MPRETK, licenseActivities: ['Переработка металлических отходов', 'Плавление и литьё металлов', 'Утилизация аккумуляторов'],
      ecoPassportNumber: 'ЭП-2023-0312', ecoPassportDate: '01.06.2023',
      wasteTypes: ['group_23', 'group_12', 'group_13'],
      capacities: [
        { wasteType: 'group_23', capacityTons: 500, currentLoadTons: 310 },
        { wasteType: 'group_12', capacityTons: 200, currentLoadTons: 85 },
        { wasteType: 'group_13', capacityTons: 150, currentLoadTons: 60 },
      ],
      technologies: { group_23: 'Плавление и литьё', group_12: 'Электрохимическая переработка', group_13: 'Демонтаж и сепарация' },
      equipment: 'Индукционная печь IF-500, пресс HP-200, сепаратор магнитный MS-100',
      productionArea: 3200, employeesCount: '41', certifications: ['ГОСТ Р', 'ISO 9001'], processingMethods: ['Плавление', 'Литьё', 'Электрохимическая переработка'],
      inspectionStatus: 'compliant', lastInspectionDate: '12.09.2025', inspectionRemarks: null, nextInspectionDate: '12.03.2026',
      processedCurrentYear: 780, processedPreviousYear: 650,
      status: 'active', suspensionReason: null, updatedAt: '12.01.2026', notes: null,
      addedDate: '20.04.2023', addedBy: 'Мамытова А.',
      coordinates: { lat: 42.8534, lng: 74.6123 },
      documents: [
        { name: 'Лицензия ЛИЦ-2023-034', type: 'pdf', size: '2.3 МБ', date: '20.04.2023' },
        { name: 'Экологический паспорт ЭП-2023-0312', type: 'pdf', size: '1.6 МБ', date: '01.06.2023' },
        { name: 'Акт проверки №178', type: 'pdf', size: '1.0 МБ', date: '12.09.2025' },
        { name: 'Сертификат оборудования', type: 'pdf', size: '2.9 МБ', date: '20.04.2023' },
      ],
      rating: 4.5,
    },
    {
      id: 5, name: 'ОсОО «СтеклоПром»', fullName: 'Общество с ограниченной ответственностью «СтеклоПром»', opf: 'ОсОО', inn: '02604200510456',
      region: 'Чуйская', address: 'г. Токмок, ул. Заводская, 12', legalAddress: 'г. Токмок, ул. Заводская, 12', actualAddress: 'г. Токмок, Промзона, строение 12',
      directorName: 'Сыдыков Бекболот Кадырович', directorPosition: 'Генеральный директор',
      contactPerson: null, contactPosition: null,
      contactPhone: '+996 555 900 100', contactEmail: 'glass@stekloprom.kg', website: '\u2014',
      licenseNumber: 'ЛИЦ-2022-056', licenseDate: '15.07.2022', licenseExpiry: '15.07.2027',
      licenseAuthority: MPRETK, licenseActivities: ['Переработка стеклянных отходов', 'Дробление и переплавка стекла'],
      ecoPassportNumber: null, ecoPassportDate: null,
      wasteTypes: ['group_8', 'group_22'],
      capacities: [
        { wasteType: 'group_8', capacityTons: 350, currentLoadTons: 210 },
        { wasteType: 'group_22', capacityTons: 100, currentLoadTons: 45 },
      ],
      technologies: { group_8: 'Дробление и переплавка', group_22: 'Измельчение и формовка' },
      equipment: 'Стеклоплавильная печь GF-400, дробилка GC-200, формовочная линия GL-100',
      productionArea: 1500, employeesCount: '22', certifications: ['ISO 14001'], processingMethods: ['Дробление', 'Переплавка', 'Формовка'],
      inspectionStatus: 'reinspection_required', lastInspectionDate: '20.06.2025',
      inspectionRemarks: 'Рекомендовано обновить систему фильтрации дымовых газов',
      nextInspectionDate: '20.12.2025',
      processedCurrentYear: 420, processedPreviousYear: 380,
      status: 'active', suspensionReason: null, updatedAt: '06.01.2026', notes: 'Единственный переработчик стекла в Чуйской области',
      addedDate: '15.07.2022', addedBy: 'Асанов Б.',
      coordinates: { lat: 42.7639, lng: 75.0012 },
      documents: [
        { name: 'Лицензия ЛИЦ-2022-056', type: 'pdf', size: '1.9 МБ', date: '15.07.2022' },
        { name: 'Акт проверки №112', type: 'pdf', size: '0.8 МБ', date: '20.06.2025' },
        { name: 'Паспорт печи', type: 'pdf', size: '3.5 МБ', date: '15.07.2022' },
      ],
      rating: 4.3,
    },
    {
      id: 6, name: 'ОсОО «АвтоУтиль»', fullName: 'Общество с ограниченной ответственностью «АвтоУтиль»', opf: 'ОсОО', inn: '01903200410678',
      region: 'Бишкек', address: 'г. Бишкек, ул. Южная Магистраль, 200', legalAddress: 'г. Бишкек, ул. Южная Магистраль, 200', actualAddress: 'г. Бишкек, ул. Южная Магистраль, 200, территория автобазы',
      directorName: 'Маматов Азиз Рустамович', directorPosition: 'Директор',
      contactPerson: 'Джумабеков Эрбол Талантович', contactPosition: 'Заместитель директора',
      contactPhone: '+996 555 200 300', contactEmail: 'auto@autoutil.kg', website: 'www.autoutil.kg',
      licenseNumber: 'ЛИЦ-2024-012', licenseDate: '01.02.2024', licenseExpiry: '01.02.2029',
      licenseAuthority: MPRETK, licenseActivities: ['Переработка автомобильных шин и покрышек', 'Утилизация отработанных масел', 'Переработка резинотехнических изделий', 'Утилизация автомобильных фильтров'],
      ecoPassportNumber: 'ЭП-2024-0045', ecoPassportDate: '15.02.2024',
      wasteTypes: ['group_4', 'group_3', 'group_5', 'group_18'],
      capacities: [
        { wasteType: 'group_4', capacityTons: 250, currentLoadTons: 180 },
        { wasteType: 'group_3', capacityTons: 150, currentLoadTons: 90 },
        { wasteType: 'group_5', capacityTons: 100, currentLoadTons: 55 },
        { wasteType: 'group_18', capacityTons: 80, currentLoadTons: 30 },
      ],
      technologies: { group_4: 'Механическое дробление и пиролиз', group_3: 'Термическая переработка масел', group_5: 'Сортировка и прессование', group_18: 'Промышленная переработка' },
      equipment: 'Шредер шин TS-600, пиролизная печь PY-300, установка регенерации масел OR-100',
      productionArea: 3500, employeesCount: '18', certifications: ['ISO 14001'], processingMethods: ['Механическое дробление', 'Пиролиз', 'Регенерация масел'],
      inspectionStatus: 'compliant', lastInspectionDate: '18.11.2025', inspectionRemarks: null, nextInspectionDate: '18.05.2026',
      processedCurrentYear: 350, processedPreviousYear: 280,
      status: 'active', suspensionReason: null, updatedAt: '10.01.2026', notes: null,
      addedDate: '01.02.2024', addedBy: 'Мамытова А.',
      coordinates: { lat: 42.8321, lng: 74.5876 },
      documents: [
        { name: 'Лицензия ЛИЦ-2024-012', type: 'pdf', size: '2.5 МБ', date: '01.02.2024' },
        { name: 'Экологический паспорт ЭП-2024-0045', type: 'pdf', size: '1.4 МБ', date: '15.02.2024' },
        { name: 'Акт проверки №215', type: 'pdf', size: '1.2 МБ', date: '18.11.2025' },
        { name: 'Сертификат оборудования пиролиза', type: 'pdf', size: '3.0 МБ', date: '15.01.2024' },
      ],
      rating: 4.4,
    },
    {
      id: 7, name: 'ОсОО «ТекстильРесайкл»', fullName: 'Общество с ограниченной ответственностью «ТекстильРесайкл»', opf: 'ОсОО', inn: '03102200310890',
      region: 'Ошская', address: 'г. Ош, ул. Курманжан Датка, 55', legalAddress: 'г. Ош, ул. Курманжан Датка, 55', actualAddress: 'г. Ош, ул. Курманжан Датка, 55, цех 1',
      directorName: 'Жумабаев Нурмат Калысович', directorPosition: 'Директор',
      contactPerson: null, contactPosition: null,
      contactPhone: '+996 555 400 500', contactEmail: 'info@textilrecycle.kg', website: '\u2014',
      licenseNumber: 'ЛИЦ-2023-045', licenseDate: '10.05.2023', licenseExpiry: '10.05.2028',
      licenseAuthority: MPRETK, licenseActivities: ['Сбор и переработка текстильных отходов', 'Сортировка и прессование текстиля'],
      ecoPassportNumber: null, ecoPassportDate: null,
      wasteTypes: ['group_5'],
      capacities: [
        { wasteType: 'group_5', capacityTons: 120, currentLoadTons: 0 },
      ],
      technologies: { group_5: 'Сортировка, очистка, прессование' },
      equipment: 'Сортировочный конвейер TC-100, пресс BP-50',
      productionArea: 800, employeesCount: '12', certifications: [], processingMethods: ['Сортировка', 'Очистка', 'Прессование'],
      inspectionStatus: 'violations', lastInspectionDate: '25.07.2025',
      inspectionRemarks: 'Отсутствие системы вентиляции в цехе сортировки. Нарушение правил хранения текстильных отходов.',
      nextInspectionDate: '25.01.2026',
      processedCurrentYear: 46, processedPreviousYear: 70,
      status: 'suspended',
      suspensionReason: 'Приостановлена деятельность по предписанию Госэконадзора от 01.12.2025 в связи с выявленными нарушениями условий лицензии.',
      updatedAt: '01.12.2025', notes: 'Деятельность приостановлена до устранения нарушений',
      addedDate: '10.05.2023', addedBy: 'Асанов Б.',
      coordinates: { lat: 40.5283, lng: 72.7985 },
      documents: [
        { name: 'Лицензия ЛИЦ-2023-045', type: 'pdf', size: '2.2 МБ', date: '10.05.2023' },
        { name: 'Акт проверки №156', type: 'pdf', size: '0.7 МБ', date: '25.07.2025' },
        { name: 'Уведомление о приостановке', type: 'pdf', size: '0.5 МБ', date: '01.12.2025' },
      ],
      rating: 3.8,
    },
    {
      id: 8, name: 'ОсОО «СтройПереработка»', fullName: 'Общество с ограниченной ответственностью «СтройПереработка»', opf: 'ОсОО', inn: '04201200210123',
      region: 'Бишкек', address: 'г. Бишкек, ул. Интергельпо, 33', legalAddress: 'г. Бишкек, ул. Интергельпо, 33', actualAddress: 'г. Бишкек, ул. Интергельпо, 33',
      directorName: 'Токтосунов Марат Абдылдаевич', directorPosition: 'Директор',
      contactPerson: null, contactPosition: null,
      contactPhone: '+996 555 600 700', contactEmail: 'stroi@pererabotka.kg', website: '\u2014',
      licenseNumber: 'ЛИЦ-2022-023', licenseDate: '05.03.2022', licenseExpiry: '05.03.2027',
      licenseAuthority: MPRETK, licenseActivities: ['Переработка строительных отходов', 'Дробление и сортировка инертных материалов'],
      ecoPassportNumber: null, ecoPassportDate: null,
      wasteTypes: ['group_24'],
      capacities: [
        { wasteType: 'group_24', capacityTons: 800, currentLoadTons: 0 },
      ],
      technologies: { group_24: 'Дробление и сортировка инертных материалов' },
      equipment: 'Дробилка CI-800 (выведена из эксплуатации)',
      productionArea: 5000, employeesCount: '0', certifications: [], processingMethods: ['Дробление', 'Сортировка инертных материалов'],
      inspectionStatus: 'violations', lastInspectionDate: '10.04.2025',
      inspectionRemarks: 'Грубые нарушения: отсутствие экологического мониторинга, превышение ПДВ в 3 раза, отсутствие документации на оборудование.',
      nextInspectionDate: null,
      processedCurrentYear: 0, processedPreviousYear: 321,
      status: 'revoked',
      suspensionReason: 'Исключён из реестра решением МПРЭТН от 15.09.2025 за систематические нарушения лицензионных требований.',
      updatedAt: '15.09.2025', notes: 'Лицензия аннулирована. Территория подлежит рекультивации.',
      addedDate: '05.03.2022', addedBy: 'Мамытова А.',
      coordinates: { lat: 42.8467, lng: 74.6234 },
      documents: [
        { name: 'Лицензия ЛИЦ-2022-023', type: 'pdf', size: '2.0 МБ', date: '05.03.2022' },
        { name: 'Акт проверки №045', type: 'pdf', size: '1.4 МБ', date: '10.04.2025' },
        { name: 'Решение об исключении', type: 'pdf', size: '0.6 МБ', date: '15.09.2025' },
      ],
      rating: 2.5,
    },
  ],
})

// ═══ Functions ═══

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/recyclers')
    if (Array.isArray(data)) {
      state.recyclers = data
    } else if (data?.content && Array.isArray(data.content)) {
      state.recyclers = data.content
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function addRecycler(data: Omit<Recycler, 'id'>): Recycler {
  const recycler: Recycler = { id: nextId++, ...data }
  state.recyclers.push(recycler)
  api.post('/recyclers', data).catch(() => {})
  return recycler
}

function updateRecycler(id: number, updates: Partial<Recycler>) {
  const idx = state.recyclers.findIndex(r => r.id === id)
  if (idx !== -1) {
    const now = new Date()
    const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    state.recyclers[idx] = { ...state.recyclers[idx], ...updates, updatedAt: dateStr }
  }
  api.put(`/recyclers/${id}`, updates).catch(() => {})
}

function toggleStatus(id: number) {
  const recycler = state.recyclers.find(r => r.id === id)
  if (recycler) {
    recycler.status = recycler.status === 'active' ? 'suspended' : 'active'
    const now = new Date()
    recycler.updatedAt = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  api.post(`/recyclers/${id}/toggle-status`).catch(() => {})
}

function getActiveRecyclers(): Recycler[] {
  return state.recyclers.filter(r => r.status === 'active')
}

function getActiveRecyclersByGroup(groupValue: string): Recycler[] {
  return state.recyclers.filter(r => r.status === 'active' && r.wasteTypes.includes(groupValue))
}

function getRecyclerById(id: number): Recycler | undefined {
  return state.recyclers.find(r => r.id === id)
}

function getRecyclerByName(name: string): Recycler | undefined {
  return state.recyclers.find(r => r.name === name)
}

function getCounts() {
  const all = state.recyclers.length
  const active = state.recyclers.filter(r => r.status === 'active').length
  const suspended = state.recyclers.filter(r => r.status === 'suspended').length
  const revoked = state.recyclers.filter(r => r.status === 'revoked').length
  return { all, active, suspended, revoked }
}

function getTotalCapacity(recycler: Recycler): number {
  return recycler.capacities.reduce((sum, c) => sum + c.capacityTons, 0)
}

function getTotalLoad(recycler: Recycler): number {
  return recycler.capacities.reduce((sum, c) => sum + c.currentLoadTons, 0)
}

function getLoadPercent(recycler: Recycler): number {
  const total = getTotalCapacity(recycler)
  if (total === 0) return 0
  return Math.round((getTotalLoad(recycler) / total) * 100)
}

function getCapacityForGroup(recycler: Recycler, groupValue: string): RecyclerCapacity | undefined {
  return recycler.capacities.find(c => c.wasteType === groupValue)
}

function getFreeCapacityForGroup(recycler: Recycler, groupValue: string): number {
  const cap = getCapacityForGroup(recycler, groupValue)
  if (!cap) return 0
  return Math.max(0, cap.capacityTons - cap.currentLoadTons)
}

/** Convert yearly tons to monthly */
function toMonthly(tonsYear: number): number {
  return Math.round(tonsYear / 12)
}

/** Get volume change percent (current vs previous year) */
function getVolumeChangePercent(recycler: Recycler): number {
  if (recycler.processedPreviousYear === 0) return recycler.processedCurrentYear > 0 ? 100 : 0
  return Math.round(((recycler.processedCurrentYear - recycler.processedPreviousYear) / recycler.processedPreviousYear) * 100)
}

/** Status labels per TZ */
function getStatusLabel(status: RecyclerStatus): string {
  switch (status) {
    case 'active': return 'Активен'
    case 'suspended': return 'Приостановлен'
    case 'revoked': return 'Исключён'
  }
}

/** Inspection status labels */
function getInspectionStatusLabel(status: InspectionStatus): string {
  switch (status) {
    case 'compliant': return 'Соответствует требованиям'
    case 'violations': return 'Выявлены нарушения'
    case 'reinspection_required': return 'Требуется повторная проверка'
  }
}

export const recyclerStore = {
  state,
  fetchAll,
  addRecycler,
  updateRecycler,
  toggleStatus,
  getActiveRecyclers,
  getActiveRecyclersByGroup,
  getRecyclerById,
  getRecyclerByName,
  getCounts,
  getTotalCapacity,
  getTotalLoad,
  getLoadPercent,
  getCapacityForGroup,
  getFreeCapacityForGroup,
  toMonthly,
  getVolumeChangePercent,
  getStatusLabel,
  getInspectionStatusLabel,
}
