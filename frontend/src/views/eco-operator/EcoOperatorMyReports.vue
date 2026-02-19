<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'

const { roleTitle, menuItems } = useEcoOperatorMenu()

// Current view
const currentView = ref<'list' | 'detail'>('list')
const selectedReport = ref<Report | null>(null)

// Filters
const searchQuery = ref('')
const selectedYear = ref(2026)
const selectedQuarter = ref('all')
const selectedStatus = ref('all')

const years = [2030, 2029, 2028, 2027, 2026, 2025]
const quarters = [
  { id: 'all', name: 'Все кварталы' },
  { id: 'q1', name: 'I квартал' },
  { id: 'q2', name: 'II квартал' },
  { id: 'q3', name: 'III квартал' },
  { id: 'q4', name: 'IV квартал' },
]
const statuses = [
  { id: 'all', name: 'Все статусы' },
  { id: 'draft', name: 'Черновик' },
  { id: 'submitted', name: 'Отправлен' },
  { id: 'approved', name: 'Принят' },
  { id: 'rejected', name: 'Отклонён' },
]

// Waste data interface for report details
interface WasteItem {
  wasteType: string
  code: string
  source: string
  method: string
  accepted: number
  processed: number
}

// Reports data
interface Report {
  id: number
  number: string
  type: string
  period: string
  quarter: string
  year: number
  submittedDate: string | null
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  totalVolume: number
  wasteTypesCount: number
  comment?: string
  wasteData: WasteItem[]
}

const reports = ref<Report[]>([
  // 2026 год
  {
    id: 20,
    number: 'ОТЧ-2026-001',
    type: 'Отчёт о переработке отходов',
    period: 'I квартал 2026',
    quarter: 'q1',
    year: 2026,
    submittedDate: null,
    status: 'draft',
    totalVolume: 1200,
    wasteTypesCount: 5,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 380, processed: 365 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 420, processed: 410 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 180, processed: 175 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 120, processed: 115 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 100, processed: 95 },
    ],
  },
  // 2025 год
  {
    id: 10,
    number: 'ОТЧ-2025-001',
    type: 'Отчёт о переработке отходов',
    period: 'I квартал 2025',
    quarter: 'q1',
    year: 2025,
    submittedDate: '2025-04-12',
    status: 'approved',
    totalVolume: 2680,
    wasteTypesCount: 9,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 520, processed: 505 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 750, processed: 735 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 280, processed: 270 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 180, processed: 175 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 220, processed: 210 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'ОсОО "АвтоШина"', method: 'Измельчение в крошку', accepted: 350, processed: 340 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'ОАО "ОшМеталл"', method: 'Демонтаж и переплавка', accepted: 120, processed: 115 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'ОсОО "ЭлектроРесурс"', method: 'Сортировка и извлечение', accepted: 160, processed: 150 },
      { wasteType: 'Масла отработанные', code: 'МС-01', source: 'СТО "АвтоМастер"', method: 'Регенерация', accepted: 100, processed: 95 },
    ],
  },
  {
    id: 11,
    number: 'ОТЧ-2025-002',
    type: 'Отчёт о переработке отходов',
    period: 'II квартал 2025',
    quarter: 'q2',
    year: 2025,
    submittedDate: '2025-07-10',
    status: 'approved',
    totalVolume: 2920,
    wasteTypesCount: 10,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 580, processed: 565 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 820, processed: 805 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 310, processed: 300 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 200, processed: 195 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 250, processed: 240 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'ОсОО "АвтоШина"', method: 'Измельчение в крошку', accepted: 380, processed: 370 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'ОАО "ОшМеталл"', method: 'Демонтаж и переплавка', accepted: 130, processed: 125 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'ОсОО "ЭлектроРесурс"', method: 'Сортировка и извлечение', accepted: 150, processed: 140 },
      { wasteType: 'Текстильные отходы', code: 'ТК-01', source: 'ОсОО "ТекстильПром"', method: 'Измельчение и переработка', accepted: 100, processed: 95 },
      { wasteType: 'Упаковка комбинированная', code: 'УП-01', source: 'ОсОО "ДжАПласт"', method: 'Сепарация и переработка', accepted: 120, processed: 105 },
    ],
  },
  {
    id: 12,
    number: 'ОТЧ-2025-003',
    type: 'Отчёт о переработке отходов',
    period: 'III квартал 2025',
    quarter: 'q3',
    year: 2025,
    submittedDate: '2025-10-08',
    status: 'submitted',
    totalVolume: 3150,
    wasteTypesCount: 11,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 620, processed: 600 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 880, processed: 865 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 340, processed: 330 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 220, processed: 215 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 280, processed: 270 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'ОсОО "АвтоШина"', method: 'Измельчение в крошку', accepted: 410, processed: 400 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'ОАО "ОшМеталл"', method: 'Демонтаж и переплавка', accepted: 145, processed: 140 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'ОсОО "ЭлектроРесурс"', method: 'Сортировка и извлечение', accepted: 170, processed: 160 },
      { wasteType: 'Масла отработанные', code: 'МС-01', source: 'СТО "АвтоМастер"', method: 'Регенерация', accepted: 110, processed: 105 },
      { wasteType: 'Упаковка ПВХ', code: 'ПЛ-03', source: 'ОсОО "ОшПластик"', method: 'Сепарация и грануляция', accepted: 85, processed: 80 },
      { wasteType: 'Стекло цветное', code: 'СТ-02', source: 'ОсОО "ЭкоГласс"', method: 'Переплавка', accepted: 90, processed: 85 },
    ],
  },
  {
    id: 13,
    number: 'ОТЧ-2025-004',
    type: 'Отчёт о переработке отходов',
    period: 'IV квартал 2025',
    quarter: 'q4',
    year: 2025,
    submittedDate: null,
    status: 'draft',
    totalVolume: 2100,
    wasteTypesCount: 8,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 480, processed: 460 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 650, processed: 640 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 260, processed: 250 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 180, processed: 175 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'ОсОО "АвтоШина"', method: 'Измельчение в крошку', accepted: 300, processed: 290 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'ОАО "ОшМеталл"', method: 'Демонтаж и переплавка', accepted: 100, processed: 95 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'ОсОО "ЭлектроРесурс"', method: 'Сортировка и извлечение', accepted: 130, processed: 120 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 180, processed: 170 },
    ],
  },
  // 2024 год
  {
    id: 1,
    number: 'ОТЧ-2024-001',
    type: 'Отчёт о переработке отходов',
    period: 'I квартал 2024',
    quarter: 'q1',
    year: 2024,
    submittedDate: '2024-04-10',
    status: 'approved',
    totalVolume: 2450,
    wasteTypesCount: 8,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 450, processed: 430 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 680, processed: 670 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 220, processed: 210 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 150, processed: 145 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 180, processed: 175 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'ОсОО "АвтоШина"', method: 'Измельчение в крошку', accepted: 320, processed: 310 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'ОАО "ОшМеталл"', method: 'Демонтаж и переплавка', accepted: 110, processed: 105 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'ОсОО "ЭлектроРесурс"', method: 'Сортировка и извлечение', accepted: 140, processed: 130 },
    ],
  },
  {
    id: 2,
    number: 'ОТЧ-2024-002',
    type: 'Отчёт о переработке отходов',
    period: 'II квартал 2024',
    quarter: 'q2',
    year: 2024,
    submittedDate: '2024-07-08',
    status: 'approved',
    totalVolume: 2780,
    wasteTypesCount: 9,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 490, processed: 475 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 720, processed: 710 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 250, processed: 240 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 170, processed: 165 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 200, processed: 195 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'ОсОО "АвтоШина"', method: 'Измельчение в крошку', accepted: 360, processed: 350 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'ОАО "ОшМеталл"', method: 'Демонтаж и переплавка', accepted: 120, processed: 115 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'ОсОО "ЭлектроРесурс"', method: 'Сортировка и извлечение', accepted: 150, processed: 140 },
      { wasteType: 'Масла отработанные', code: 'МС-01', source: 'СТО "АвтоМастер"', method: 'Регенерация', accepted: 80, processed: 75 },
    ],
  },
  {
    id: 3,
    number: 'ОТЧ-2024-003',
    type: 'Отчёт о переработке отходов',
    period: 'III квартал 2024',
    quarter: 'q3',
    year: 2024,
    submittedDate: '2024-10-12',
    status: 'approved',
    totalVolume: 3120,
    wasteTypesCount: 10,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 550, processed: 535 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 800, processed: 785 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 300, processed: 290 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 190, processed: 185 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 230, processed: 220 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'ОсОО "АвтоШина"', method: 'Измельчение в крошку', accepted: 400, processed: 390 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'ОАО "ОшМеталл"', method: 'Демонтаж и переплавка', accepted: 140, processed: 135 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'ОсОО "ЭлектроРесурс"', method: 'Сортировка и извлечение', accepted: 160, processed: 150 },
      { wasteType: 'Масла отработанные', code: 'МС-01', source: 'СТО "АвтоМастер"', method: 'Регенерация', accepted: 100, processed: 95 },
      { wasteType: 'Текстильные отходы', code: 'ТК-01', source: 'ОсОО "ТекстильПром"', method: 'Измельчение и переработка', accepted: 80, processed: 75 },
    ],
  },
  {
    id: 4,
    number: 'ОТЧ-2024-004',
    type: 'Отчёт о переработке отходов',
    period: 'IV квартал 2024',
    quarter: 'q4',
    year: 2024,
    submittedDate: '2025-01-15',
    status: 'approved',
    totalVolume: 2850,
    wasteTypesCount: 9,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'ОсОО "БишкекПласт"', method: 'Механическая переработка', accepted: 500, processed: 485 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'ОсОО "ТаласПак"', method: 'Прессование и переработка', accepted: 750, processed: 735 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'ИП "Асанов"', method: 'Переплавка', accepted: 280, processed: 270 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'ОсОО "МегаТрейд"', method: 'Переплавка', accepted: 180, processed: 175 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'ОсОО "GreenPack"', method: 'Грануляция', accepted: 210, processed: 200 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'ОсОО "АвтоШина"', method: 'Измельчение в крошку', accepted: 380, processed: 370 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'ОАО "ОшМеталл"', method: 'Демонтаж и переплавка', accepted: 130, processed: 125 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'ОсОО "ЭлектроРесурс"', method: 'Сортировка и извлечение', accepted: 155, processed: 145 },
      { wasteType: 'Масла отработанные', code: 'МС-01', source: 'СТО "АвтоМастер"', method: 'Регенерация', accepted: 95, processed: 90 },
    ],
  },
  {
    id: 5,
    number: 'ГОД-2024-001',
    type: 'Годовой отчёт',
    period: '2024 год',
    quarter: 'all',
    year: 2024,
    submittedDate: '2025-02-28',
    status: 'approved',
    totalVolume: 11200,
    wasteTypesCount: 12,
    wasteData: [
      { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', source: 'Различные поставщики', method: 'Механическая переработка', accepted: 1990, processed: 1925 },
      { wasteType: 'Гофрокартон', code: 'БМ-01', source: 'Различные поставщики', method: 'Прессование и переработка', accepted: 2950, processed: 2900 },
      { wasteType: 'Стекло бесцветное', code: 'СТ-01', source: 'Различные поставщики', method: 'Переплавка', accepted: 1050, processed: 1010 },
      { wasteType: 'Алюминиевая банка', code: 'МЕ-01', source: 'Различные поставщики', method: 'Переплавка', accepted: 690, processed: 670 },
      { wasteType: 'HDPE (полиэтилен высокой плотности)', code: 'ПЛ-02', source: 'Различные поставщики', method: 'Грануляция', accepted: 820, processed: 790 },
      { wasteType: 'Шины автомобильные', code: 'РЗ-01', source: 'Различные поставщики', method: 'Измельчение в крошку', accepted: 1460, processed: 1420 },
      { wasteType: 'Аккумуляторы свинцовые', code: 'АК-01', source: 'Различные поставщики', method: 'Демонтаж и переплавка', accepted: 500, processed: 480 },
      { wasteType: 'Электронный лом', code: 'ЭЛ-01', source: 'Различные поставщики', method: 'Сортировка и извлечение', accepted: 605, processed: 565 },
      { wasteType: 'Масла отработанные', code: 'МС-01', source: 'Различные поставщики', method: 'Регенерация', accepted: 355, processed: 340 },
      { wasteType: 'Текстильные отходы', code: 'ТК-01', source: 'Различные поставщики', method: 'Измельчение и переработка', accepted: 280, processed: 265 },
      { wasteType: 'Стекло цветное', code: 'СТ-02', source: 'Различные поставщики', method: 'Переплавка', accepted: 250, processed: 240 },
      { wasteType: 'Упаковка комбинированная', code: 'УП-01', source: 'Различные поставщики', method: 'Сепарация и переработка', accepted: 250, processed: 230 },
    ],
  },
])

// Filtered reports
const filteredReports = computed(() => {
  return reports.value.filter(r => {
    const matchesSearch = !searchQuery.value ||
      r.number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesYear = r.year === selectedYear.value
    const matchesQuarter = selectedQuarter.value === 'all' || r.quarter === selectedQuarter.value
    const matchesStatus = selectedStatus.value === 'all' || r.status === selectedStatus.value
    return matchesSearch && matchesYear && matchesQuarter && matchesStatus
  })
})

// Stats
const stats = computed(() => {
  const yearReports = reports.value.filter(r => r.year === selectedYear.value)
  return {
    total: yearReports.length,
    approved: yearReports.filter(r => r.status === 'approved').length,
    pending: yearReports.filter(r => r.status === 'submitted').length,
    drafts: yearReports.filter(r => r.status === 'draft').length,
    totalVolume: yearReports.reduce((sum, r) => sum + r.totalVolume, 0),
  }
})

// Status helpers
const getStatusClass = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-700'
    case 'submitted': return 'bg-blue-100 text-blue-700'
    case 'draft': return 'bg-gray-100 text-gray-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return 'Принят'
    case 'submitted': return 'На рассмотрении'
    case 'draft': return 'Черновик'
    case 'rejected': return 'Отклонён'
    default: return status
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

const formatNumber = (num: number) => num.toLocaleString('ru-RU')

// View report details
const viewReport = (report: Report) => {
  selectedReport.value = report
  currentView.value = 'detail'
}

const goBackToList = () => {
  selectedReport.value = null
  currentView.value = 'list'
}

// Calculate totals for detail view
const detailTotals = computed(() => {
  if (!selectedReport.value) return { accepted: 0, processed: 0 }
  return {
    accepted: selectedReport.value.wasteData.reduce((sum, w) => sum + w.accepted, 0),
    processed: selectedReport.value.wasteData.reduce((sum, w) => sum + w.processed, 0),
  }
})

// PDF Generation using canvas-based approach (simplified)
const downloadPDF = async () => {
  if (!selectedReport.value) return

  const report = selectedReport.value

  // Create printable HTML content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Отчёт ${report.number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0e888d; padding-bottom: 20px; }
        .header h1 { color: #0e888d; font-size: 18px; margin-bottom: 5px; }
        .header p { color: #666; font-size: 11px; }
        .company { margin-bottom: 25px; }
        .company h2 { font-size: 14px; color: #333; margin-bottom: 10px; }
        .company-info { display: flex; flex-wrap: wrap; gap: 20px; }
        .company-info div { flex: 1; min-width: 200px; }
        .company-info label { display: block; color: #666; font-size: 10px; margin-bottom: 2px; }
        .company-info span { font-weight: bold; color: #333; }
        .report-info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
        .report-info h3 { font-size: 13px; margin-bottom: 10px; color: #333; }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .info-grid div label { display: block; color: #666; font-size: 10px; }
        .info-grid div span { font-weight: bold; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #0e888d; color: white; padding: 10px 8px; text-align: left; font-size: 10px; }
        td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
        tr:nth-child(even) { background: #f9f9f9; }
        .totals { background: #e8f5e9; }
        .totals td { font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 10px; }
        .status { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; }
        .status-approved { background: #d4edda; color: #155724; }
        .status-submitted { background: #cce5ff; color: #004085; }
        .status-draft { background: #e2e3e5; color: #383d41; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ГП ЭКО ОПЕРАТОР</h1>
        <p>Государственное предприятие «Эко Оператор»</p>
      </div>

      <div class="company">
        <h2>Данные организации</h2>
        <div class="company-info">
          <div><label>Наименование:</label><span>ОсОО «ЭкоПереработка»</span></div>
          <div><label>ИНН:</label><span>02301200510234</span></div>
          <div><label>Юридический адрес:</label><span>г. Бишкек, ул. Экологическая, 15</span></div>
          <div><label>Лицензия:</label><span>ЛЦ-ЭКО-2024-0045</span></div>
        </div>
      </div>

      <div class="report-info">
        <h3>Информация об отчёте</h3>
        <div class="info-grid">
          <div><label>Номер отчёта:</label><span>${report.number}</span></div>
          <div><label>Тип отчёта:</label><span>${report.type}</span></div>
          <div><label>Период:</label><span>${report.period}</span></div>
          <div><label>Дата подачи:</label><span>${formatDate(report.submittedDate)}</span></div>
          <div><label>Статус:</label><span class="status status-${report.status}">${getStatusText(report.status)}</span></div>
          <div><label>Видов отходов:</label><span>${report.wasteTypesCount}</span></div>
        </div>
      </div>

      <h3 style="margin-bottom: 15px; font-size: 13px;">Данные о переработке</h3>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Вид отходов</th>
            <th>Код</th>
            <th>Источник</th>
            <th>Метод переработки</th>
            <th>Принято (т)</th>
            <th>Переработано (т)</th>
          </tr>
        </thead>
        <tbody>
          ${report.wasteData.map((w, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${w.wasteType}</td>
              <td>${w.code}</td>
              <td>${w.source}</td>
              <td>${w.method}</td>
              <td>${w.accepted.toLocaleString('ru-RU')}</td>
              <td>${w.processed.toLocaleString('ru-RU')}</td>
            </tr>
          `).join('')}
          <tr class="totals">
            <td colspan="5" style="text-align: right;">ИТОГО:</td>
            <td>${detailTotals.value.accepted.toLocaleString('ru-RU')} т</td>
            <td>${detailTotals.value.processed.toLocaleString('ru-RU')} т</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Документ сформирован: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}</p>
        <p>ГП Эко Оператор | www.eco.gov.kg</p>
      </div>
    </body>
    </html>
  `

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

// Excel Export
const downloadExcel = () => {
  if (!selectedReport.value) return

  const report = selectedReport.value

  let csvContent = '\uFEFF' // BOM for UTF-8
  csvContent += `Отчёт о переработке отходов\n`
  csvContent += `Организация:,ОсОО «ЭкоПереработка»\n`
  csvContent += `ИНН:,02301200510234\n`
  csvContent += `Номер отчёта:,${report.number}\n`
  csvContent += `Период:,${report.period}\n`
  csvContent += `Дата подачи:,${formatDate(report.submittedDate)}\n`
  csvContent += `Статус:,${getStatusText(report.status)}\n\n`
  csvContent += `№,Вид отходов,Код,Источник,Метод переработки,Принято (т),Переработано (т)\n`

  report.wasteData.forEach((w, i) => {
    csvContent += `${i + 1},"${w.wasteType}",${w.code},"${w.source}","${w.method}",${w.accepted},${w.processed}\n`
  })

  csvContent += `\n,,,,,${detailTotals.value.accepted},${detailTotals.value.processed}\n`
  csvContent += `\nДата формирования:,${new Date().toLocaleDateString('ru-RU')}\n`

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${report.number}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// Print function
const printReport = () => {
  downloadPDF()
}

// Wizard state
const showWizard = ref(false)
const wizardStep = ref(1)

// Report form data
const reportForm = ref({
  type: 'quarterly',
  quarter: 'q4',
  year: 2026,
  wasteData: [
    { wasteType: 'ПЭТ (полиэтилентерефталат)', code: 'ПЛ-01', accepted: 450, processed: 430 },
    { wasteType: 'Гофрокартон', code: 'БМ-01', accepted: 680, processed: 670 },
    { wasteType: 'Стекло бесцветное', code: 'СТ-01', accepted: 220, processed: 210 },
  ],
  documents: [] as File[],
  comment: '',
})

const totalAccepted = computed(() => reportForm.value.wasteData.reduce((sum, w) => sum + w.accepted, 0))
const totalProcessed = computed(() => reportForm.value.wasteData.reduce((sum, w) => sum + w.processed, 0))

const addWasteRow = () => {
  reportForm.value.wasteData.push({ wasteType: '', code: '', accepted: 0, processed: 0 })
}

const removeWasteRow = (index: number) => {
  reportForm.value.wasteData.splice(index, 1)
}

const nextStep = () => {
  if (wizardStep.value < 4) wizardStep.value++
}

const prevStep = () => {
  if (wizardStep.value > 1) wizardStep.value--
}

const submitReport = () => {
  toastStore.show({ type: 'success', title: 'Отчёт успешно отправлен' })
  showWizard.value = false
  wizardStep.value = 1
}

const saveDraft = () => {
  toastStore.show({ type: 'success', title: 'Черновик сохранён' })
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <!-- Report Detail View -->
    <div v-if="currentView === 'detail' && selectedReport" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBackToList"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900">{{ selectedReport.number }}</h1>
              <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusClass(selectedReport.status)]">
                {{ getStatusText(selectedReport.status) }}
              </span>
            </div>
            <p class="text-gray-600 mt-1">{{ selectedReport.type }} — {{ selectedReport.period }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="goBackToList"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {{ $t('common.backToList') }}
          </button>
          <button
            @click="downloadExcel"
            class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ $t('common.excel') }}
          </button>
          <button
            @click="downloadPDF"
            class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ $t('common.pdf') }}
          </button>
          <button
            @click="printReport"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {{ $t('common.print') }}
          </button>
        </div>
      </div>

      <!-- Report Info Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Дата подачи</p>
          <p class="text-lg font-bold text-gray-900 mt-1">{{ formatDate(selectedReport.submittedDate) }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Видов отходов</p>
          <p class="text-lg font-bold text-gray-900 mt-1">{{ selectedReport.wasteTypesCount }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Принято всего</p>
          <p class="text-lg font-bold text-blue-600 mt-1">{{ formatNumber(detailTotals.accepted) }} т</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Переработано</p>
          <p class="text-lg font-bold text-lime-600 mt-1">{{ formatNumber(detailTotals.processed) }} т</p>
        </div>
      </div>

      <!-- Waste Data Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <h3 class="font-semibold text-gray-900">Данные о переработке отходов</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">№</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Вид отходов</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Код</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Источник</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Метод переработки</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Принято (т)</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Переработано (т)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(item, index) in selectedReport.wasteData" :key="index" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-500">{{ index + 1 }}</td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.wasteType }}</td>
                <td class="px-4 py-3 font-mono text-sm text-lime-600 bg-lime-50 rounded">{{ item.code }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.source }}</td>
                <td class="px-4 py-3 text-gray-600 text-sm">{{ item.method }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ formatNumber(item.accepted) }}</td>
                <td class="px-4 py-3 text-right font-medium text-lime-600">{{ formatNumber(item.processed) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-lime-50 border-t-2 border-lime-200">
              <tr>
                <td colspan="5" class="px-4 py-3 font-bold text-gray-900 text-right">ИТОГО:</td>
                <td class="px-4 py-3 text-right font-bold text-gray-900">{{ formatNumber(detailTotals.accepted) }} т</td>
                <td class="px-4 py-3 text-right font-bold text-lime-700 text-lg">{{ formatNumber(detailTotals.processed) }} т</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Processing Summary -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Показатели переработки</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-gray-500 mb-1">Эффективность переработки</p>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-lime-500 rounded-full"
                  :style="{ width: `${(detailTotals.processed / detailTotals.accepted) * 100}%` }"
                ></div>
              </div>
              <span class="font-bold text-lime-600">{{ Math.round((detailTotals.processed / detailTotals.accepted) * 100) }}%</span>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Потери при переработке</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatNumber(detailTotals.accepted - detailTotals.processed) }} т</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Средний объём на вид отходов</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatNumber(Math.round(detailTotals.processed / selectedReport.wasteTypesCount)) }} т</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports List View -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('pages.ecoOperator.myReportsTitle') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('pages.ecoOperator.myReportsSubtitle') }}</p>
        </div>
        <button
          @click="showWizard = true"
          class="px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('common.createReport') }}
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Всего отчётов</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Принято</p>
          <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.approved }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">На рассмотрении</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Черновики</p>
          <p class="text-2xl font-bold text-gray-600 mt-1">{{ stats.drafts }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Объём переработки</p>
          <p class="text-2xl font-bold text-lime-600 mt-1">{{ formatNumber(stats.totalVolume) }} т</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по номеру..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
          </div>
          <select
            v-model="selectedYear"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
          >
            <option v-for="year in years" :key="year" :value="year">{{ year }} год</option>
          </select>
          <select
            v-model="selectedQuarter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
          >
            <option v-for="q in quarters" :key="q.id" :value="q.id">{{ q.name }}</option>
          </select>
          <select
            v-model="selectedStatus"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
          >
            <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
      </div>

      <!-- Reports List -->
      <div class="space-y-4">
        <div
          v-for="report in filteredReports"
          :key="report.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="report.status === 'approved' ? 'bg-green-100' : report.status === 'submitted' ? 'bg-blue-100' : 'bg-gray-100'"
              >
                <svg
                  class="w-6 h-6"
                  :class="report.status === 'approved' ? 'text-green-600' : report.status === 'submitted' ? 'text-blue-600' : 'text-gray-500'"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm text-lime-600 bg-lime-50 px-2 py-0.5 rounded">{{ report.number }}</span>
                  <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(report.status)]">
                    {{ getStatusText(report.status) }}
                  </span>
                </div>
                <h3 class="font-semibold text-gray-900 mt-1">{{ report.type }}</h3>
                <p class="text-sm text-gray-500">{{ report.period }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Дата подачи</p>
              <p class="font-medium text-gray-900">{{ formatDate(report.submittedDate) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-500">Объём переработки</p>
              <p class="font-semibold text-gray-900">{{ formatNumber(report.totalVolume) }} тонн</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Видов отходов</p>
              <p class="font-semibold text-gray-900">{{ report.wasteTypesCount }}</p>
            </div>
            <div class="flex justify-end items-center gap-2">
              <button
                @click="viewReport(report)"
                class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {{ $t('common.preview') }}
              </button>
              <button v-if="report.status === 'draft'" class="px-3 py-1.5 text-sm text-lime-600 hover:text-lime-700 hover:bg-lime-50 rounded-lg transition-colors font-medium">
                {{ $t('common.edit') }}
              </button>
              <button
                v-if="report.status === 'approved'"
                @click="selectedReport = report; downloadPDF()"
                class="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {{ $t('common.downloadPdf') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredReports.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Отчёты не найдены</h3>
        <p class="text-gray-500 mb-4">Создайте новый отчёт или измените параметры фильтрации</p>
        <button
          @click="showWizard = true"
          class="px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors"
        >
          {{ $t('common.createReport') }}
        </button>
      </div>
    </div>

    <!-- Report Wizard Modal -->
    <Teleport to="body">
      <div v-if="showWizard" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Создание отчёта о переработке</h3>
              <p class="text-sm text-gray-500">Шаг {{ wizardStep }} из 4</p>
            </div>
            <button @click="showWizard = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Progress -->
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div v-for="step in 4" :key="step" class="flex items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  :class="wizardStep >= step ? 'bg-lime-600 text-white' : 'bg-gray-200 text-gray-500'"
                >
                  {{ step }}
                </div>
                <span class="ml-2 text-sm hidden md:inline" :class="wizardStep >= step ? 'text-gray-900' : 'text-gray-400'">
                  {{ step === 1 ? 'Период' : step === 2 ? 'Данные' : step === 3 ? 'Документы' : 'Проверка' }}
                </span>
                <div v-if="step < 4" class="w-12 md:w-24 h-1 mx-2 rounded" :class="wizardStep > step ? 'bg-lime-600' : 'bg-gray-200'"></div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Step 1: Period -->
            <div v-if="wizardStep === 1" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Тип отчёта</label>
                <div class="grid grid-cols-2 gap-4">
                  <label
                    class="p-4 border-2 rounded-xl cursor-pointer transition-colors"
                    :class="reportForm.type === 'quarterly' ? 'border-lime-500 bg-lime-50' : 'border-gray-200 hover:border-gray-300'"
                  >
                    <input type="radio" v-model="reportForm.type" value="quarterly" class="sr-only" />
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">Квартальный отчёт</p>
                        <p class="text-sm text-gray-500">За один квартал</p>
                      </div>
                    </div>
                  </label>
                  <label
                    class="p-4 border-2 rounded-xl cursor-pointer transition-colors"
                    :class="reportForm.type === 'annual' ? 'border-lime-500 bg-lime-50' : 'border-gray-200 hover:border-gray-300'"
                  >
                    <input type="radio" v-model="reportForm.type" value="annual" class="sr-only" />
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">Годовой отчёт</p>
                        <p class="text-sm text-gray-500">За весь год</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div v-if="reportForm.type === 'quarterly'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Квартал</label>
                  <select
                    v-model="reportForm.quarter"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  >
                    <option value="q1">I квартал (янв-мар)</option>
                    <option value="q2">II квартал (апр-июн)</option>
                    <option value="q3">III квартал (июл-сен)</option>
                    <option value="q4">IV квартал (окт-дек)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Год</label>
                  <select
                    v-model="reportForm.year"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  >
                    <option :value="2025">2025</option>
                    <option :value="2026">2026</option>
                    <option :value="2027">2027</option>
                    <option :value="2028">2028</option>
                    <option :value="2029">2029</option>
                    <option :value="2030">2030</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 2: Waste Data -->
            <div v-if="wizardStep === 2" class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="font-medium text-gray-900">Данные о переработке</h4>
                <button @click="addWasteRow" class="text-lime-600 hover:text-lime-700 text-sm font-medium flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ $t('common.addRow') }}
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600">Вид отходов</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600">Код</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600">Принято (т)</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600">Переработано (т)</th>
                      <th class="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="(row, index) in reportForm.wasteData" :key="index">
                      <td class="px-3 py-2">
                        <input
                          v-model="row.wasteType"
                          type="text"
                          class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-lime-500 text-sm"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <input
                          v-model="row.code"
                          type="text"
                          class="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-lime-500 text-sm font-mono"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <input
                          v-model.number="row.accepted"
                          type="number"
                          class="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-lime-500 text-sm"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <input
                          v-model.number="row.processed"
                          type="number"
                          class="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-lime-500 text-sm"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <button
                          @click="removeWasteRow(index)"
                          class="text-red-500 hover:text-red-700"
                          :disabled="reportForm.wasteData.length === 1"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50 font-semibold">
                    <tr>
                      <td colspan="2" class="px-3 py-2 text-right">Итого:</td>
                      <td class="px-3 py-2">{{ formatNumber(totalAccepted) }} т</td>
                      <td class="px-3 py-2">{{ formatNumber(totalProcessed) }} т</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Step 3: Documents -->
            <div v-if="wizardStep === 3" class="space-y-4">
              <h4 class="font-medium text-gray-900">Подтверждающие документы</h4>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-gray-500 mb-2">Перетащите файлы сюда или</p>
                <button class="px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors">
                  Выбрать файлы
                </button>
                <p class="text-xs text-gray-400 mt-2">PDF, JPG, PNG до 10MB</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий (необязательно)</label>
                <textarea
                  v-model="reportForm.comment"
                  rows="3"
                  placeholder="Дополнительная информация..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                ></textarea>
              </div>
            </div>

            <!-- Step 4: Review -->
            <div v-if="wizardStep === 4" class="space-y-6">
              <h4 class="font-medium text-gray-900">Проверьте данные перед отправкой</h4>

              <div class="bg-gray-50 rounded-xl p-4 space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-500">Тип отчёта:</span>
                  <span class="font-medium">{{ reportForm.type === 'quarterly' ? 'Квартальный' : 'Годовой' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Период:</span>
                  <span class="font-medium">
                    {{ reportForm.type === 'quarterly' ? `${reportForm.quarter === 'q1' ? 'I' : reportForm.quarter === 'q2' ? 'II' : reportForm.quarter === 'q3' ? 'III' : 'IV'} квартал` : '' }} {{ reportForm.year }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Видов отходов:</span>
                  <span class="font-medium">{{ reportForm.wasteData.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Всего принято:</span>
                  <span class="font-medium">{{ formatNumber(totalAccepted) }} тонн</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Всего переработано:</span>
                  <span class="font-medium">{{ formatNumber(totalProcessed) }} тонн</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Процент переработки:</span>
                  <span class="font-medium text-lime-600">{{ Math.round((totalProcessed / totalAccepted) * 100) }}%</span>
                </div>
              </div>

              <div class="bg-lime-50 border border-lime-200 rounded-xl p-4 flex items-start gap-3">
                <svg class="w-5 h-5 text-lime-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-lime-700">
                  После отправки отчёт будет направлен на проверку. Вы получите уведомление о результате.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 sticky bottom-0 bg-white z-10">
            <button
              v-if="wizardStep > 1"
              @click="prevStep"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              {{ $t('common.back') }}
            </button>
            <div v-else></div>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="saveDraft"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors w-full sm:w-auto text-center"
              >
                {{ $t('common.saveDraft') }}
              </button>
              <button
                v-if="wizardStep < 4"
                @click="nextStep"
                class="px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors w-full sm:w-auto text-center"
              >
                {{ $t('common.next') }}
              </button>
              <button
                v-else
                @click="submitReport"
                class="px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors w-full sm:w-auto text-center"
              >
                {{ $t('common.sendReport') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
