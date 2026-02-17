<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { useI18n } from 'vue-i18n'
import { toastStore } from '../../stores/toast'

const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

// ==================== MAP STATE ====================
const mapCenter = ref<[number, number]>([41.2, 74.7])
const mapZoom = ref(7)
const mapRef = ref<any>(null)
const mapSearchQuery = ref('')
const mapSearchResults = ref<MapPoint[]>([])
const showMapSearchResults = ref(false)

type LayerType = 'recyclers' | 'reception' | 'landfills' | 'dumps' | 'payers'

const layers = ref([
  { id: 'landfills' as LayerType, name: 'Полигоны ТБО', icon: '🟢', visible: true, color: '#22c55e' },
  { id: 'recyclers' as LayerType, name: 'Переработчики', icon: '🔵', visible: true, color: '#2563EB' },
  { id: 'reception' as LayerType, name: 'Пункты приёма', icon: '🟡', visible: true, color: '#EAB308' },
  { id: 'dumps' as LayerType, name: 'Несанкц. свалки', icon: '🟠', visible: true, color: '#DC2626' },
  { id: 'payers' as LayerType, name: 'Плательщики', icon: '🟣', visible: false, color: '#9333EA' },
])

interface MapPoint {
  id: number
  type: LayerType
  name: string
  lat: number
  lng: number
  address: string
  phone: string
  status: string
  description?: string
}

// ==================== REGISTRY STATE ====================
const activeRegistry = ref<LayerType>('landfills')
const registrySearchQuery = ref('')
const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const isCreating = ref(false)

const registries = [
  { id: 'landfills' as LayerType, name: 'Полигоны ТБО', icon: '🟢', color: '#22c55e' },
  { id: 'recyclers' as LayerType, name: 'Переработчики', icon: '🔵', color: '#2563EB' },
  { id: 'reception' as LayerType, name: 'Пункты приёма', icon: '🟡', color: '#EAB308' },
  { id: 'dumps' as LayerType, name: 'Несанкц. свалки', icon: '🟠', color: '#DC2626' },
  { id: 'payers' as LayerType, name: 'Плательщики', icon: '🟣', color: '#9333EA' },
]

const regions = ['г. Бишкек', 'г. Ош', 'Чуйская обл.', 'Ошская обл.', 'Джалал-Абадская обл.', 'Иссык-Кульская обл.', 'Нарынская обл.', 'Таласская обл.', 'Баткенская обл.']
const wasteTypeOptions = ['Пластик', 'Бумага', 'Картон', 'Стекло', 'Металл', 'Алюминий', 'Электроника', 'Батарейки', 'Текстиль', 'Органика', 'Шины', 'Масла', 'Строительные', 'Бытовые']

// ==================== LANDFILLS ====================
interface Landfill {
  id: number; name: string; region: string; district: string; type: string; area: number; volume: number
  wasteTypes: string[]; gpsLat: string; gpsLng: string; address: string; organization: string
  discoveryDate: string; status: string; photo: string; notes: string
}

const landfills = ref<Landfill[]>([
  { id: 1, name: 'Полигон ТБО «Бишкек»', region: 'Чуйская обл.', district: 'Аламудунский', type: 'Санкционированный', area: 45.5, volume: 125000, wasteTypes: ['Бытовые', 'Строительные'], gpsLat: '42.9234', gpsLng: '74.4567', address: 'с. Ново-Павловка', organization: 'МП «Тазалык»', discoveryDate: '01.01.1985', status: 'Активен', photo: '', notes: 'Основной полигон г. Бишкек' },
  { id: 2, name: 'Полигон ТБО «Ош»', region: 'Ошская обл.', district: 'Кара-Сууский', type: 'Санкционированный', area: 28.0, volume: 78000, wasteTypes: ['Бытовые'], gpsLat: '40.4923', gpsLng: '72.7456', address: 'пригород г. Ош', organization: 'МП «Ош-Тазалык»', discoveryDate: '15.03.1990', status: 'Активен', photo: '', notes: '' },
  { id: 3, name: 'Свалка «Токмок»', region: 'Чуйская обл.', district: 'Чуйский', type: 'Несанкционированный', area: 8.5, volume: 15000, wasteTypes: ['Бытовые', 'Строительные'], gpsLat: '42.8567', gpsLng: '75.3123', address: 'окрестности г. Токмок', organization: '', discoveryDate: '20.06.2018', status: 'Закрыт', photo: '', notes: 'Закрыта, требуется рекультивация' },
  { id: 4, name: 'Полигон «Каракол»', region: 'Иссык-Кульская обл.', district: 'Ак-Суйский', type: 'Санкционированный', area: 12.0, volume: 32000, wasteTypes: ['Бытовые'], gpsLat: '42.4567', gpsLng: '78.4234', address: 'г. Каракол', organization: 'МП «Каракол-Тазалык»', discoveryDate: '01.01.1992', status: 'На реконструкции', photo: '', notes: 'Модернизация полигона' },
  { id: 5, name: 'Полигон «Нарын»', region: 'Нарынская обл.', district: 'Нарынский', type: 'Санкционированный', area: 6.5, volume: 12000, wasteTypes: ['Бытовые'], gpsLat: '41.4012', gpsLng: '76.0123', address: 'г. Нарын', organization: 'МП «Нарын-Тазалык»', discoveryDate: '01.01.1995', status: 'Активен', photo: '', notes: '' },
  { id: 6, name: 'Полигон «Джалал-Абад»', region: 'Джалал-Абадская обл.', district: 'Сузакский', type: 'Санкционированный', area: 10.0, volume: 25000, wasteTypes: ['Бытовые'], gpsLat: '41.0567', gpsLng: '72.9567', address: 'г. Джалал-Абад', organization: 'МП «ЖА-Тазалык»', discoveryDate: '01.01.1988', status: 'Активен', photo: '', notes: '' },
  { id: 7, name: 'Полигон «Талас»', region: 'Таласская обл.', district: 'Таласский', type: 'Санкционированный', area: 5.0, volume: 8000, wasteTypes: ['Бытовые'], gpsLat: '42.4923', gpsLng: '72.2678', address: 'г. Талас', organization: 'МП «Талас-Тазалык»', discoveryDate: '01.01.1993', status: 'Активен', photo: '', notes: '' },
])

const selectedLandfill = ref<Landfill | null>(null)
const landfillForm = ref<Landfill>({ id: 0, name: '', region: '', district: '', type: 'Санкционированный', area: 0, volume: 0, wasteTypes: [], gpsLat: '', gpsLng: '', address: '', organization: '', discoveryDate: '', status: 'Активен', photo: '', notes: '' })

const filteredLandfills = computed(() => {
  if (!registrySearchQuery.value) return landfills.value
  const q = registrySearchQuery.value.toLowerCase()
  return landfills.value.filter(l => l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q))
})

// ==================== RECEPTION POINTS ====================
interface ReceptionPoint {
  id: number; name: string; region: string; district: string; address: string; gpsLat: string; gpsLng: string
  wasteTypes: string[]; workingHours: string; phone: string; email: string; organization: string; status: string; notes: string
}

const receptionPoints = ref<ReceptionPoint[]>([
  { id: 1, name: 'Пункт приёма №1', region: 'г. Бишкек', district: 'Первомайский', address: 'ул. Киевская, 45', gpsLat: '42.8821', gpsLng: '74.5823', wasteTypes: ['Пластик', 'Бумага', 'Стекло'], workingHours: '09:00-18:00', phone: '+996 555 12-34-56', email: 'punkt1@eco.kg', organization: 'ОсОО «ЭкоПереработка»', status: 'Работает', notes: '' },
  { id: 2, name: 'Пункт приёма №2', region: 'г. Бишкек', district: 'Свердловский', address: 'ул. Боконбаева, 78', gpsLat: '42.8567', gpsLng: '74.6012', wasteTypes: ['Пластик', 'Металл', 'Электроника'], workingHours: '10:00-19:00', phone: '+996 555 23-45-67', email: 'punkt2@eco.kg', organization: 'ОсОО «ЭкоПереработка»', status: 'Работает', notes: '' },
  { id: 3, name: 'Пункт приёма «Ош-1»', region: 'г. Ош', district: 'Центр', address: 'ул. Масалиева, 23', gpsLat: '40.5367', gpsLng: '72.8056', wasteTypes: ['Пластик', 'Бумага'], workingHours: '09:00-17:00', phone: '+996 550 12-34-56', email: 'osh1@eco.kg', organization: 'ОсОО «Ош-Ресайкл»', status: 'Работает', notes: '' },
  { id: 4, name: 'Пункт приёма «Каракол»', region: 'Иссык-Кульская обл.', district: 'г. Каракол', address: 'ул. Токтогула, 34', gpsLat: '42.4823', gpsLng: '78.4012', wasteTypes: ['Пластик', 'Стекло'], workingHours: '09:00-16:00', phone: '+996 557 12-34-56', email: 'karakol@eco.kg', organization: 'ОсОО «Иссык-Куль Ресурс»', status: 'Работает', notes: '' },
  { id: 5, name: 'Пункт приёма №7', region: 'г. Бишкек', district: 'Октябрьский', address: 'мкр. Аламедин, 78', gpsLat: '42.8789', gpsLng: '74.6456', wasteTypes: ['Пластик', 'Бумага', 'Батарейки'], workingHours: '10:00-18:00', phone: '+996 555 78-90-12', email: 'punkt7@eco.kg', organization: 'ОсОО «ГринРесайкл»', status: 'Временно закрыт', notes: 'Ремонт до 15.02.2025' },
  { id: 6, name: 'Пункт приёма «Джалал-Абад»', region: 'Джалал-Абадская обл.', district: 'г. Джалал-Абад', address: 'ул. Ленина, 78', gpsLat: '41.0312', gpsLng: '72.9945', wasteTypes: ['Пластик', 'Бумага'], workingHours: '09:00-17:00', phone: '+996 559 12-34-56', email: 'ja@eco.kg', organization: 'ОсОО «Джалал-Эко»', status: 'Работает', notes: '' },
  { id: 7, name: 'Пункт приёма «Нарын»', region: 'Нарынская обл.', district: 'г. Нарын', address: 'ул. Ленина, 89', gpsLat: '41.4356', gpsLng: '75.9823', wasteTypes: ['Пластик'], workingHours: '10:00-16:00', phone: '+996 556 12-34-56', email: 'naryn@eco.kg', organization: 'ОсОО «НарынЭко»', status: 'Работает', notes: '' },
  { id: 8, name: 'Пункт приёма «Талас»', region: 'Таласская обл.', district: 'г. Талас', address: 'ул. Сарыгулова, 12', gpsLat: '42.5234', gpsLng: '72.2412', wasteTypes: ['Пластик', 'Металл'], workingHours: '09:00-17:00', phone: '+996 551 12-34-56', email: 'talas@eco.kg', organization: 'ОсОО «Талас-Ресайкл»', status: 'Работает', notes: '' },
])

const selectedReception = ref<ReceptionPoint | null>(null)
const receptionForm = ref<ReceptionPoint>({ id: 0, name: '', region: '', district: '', address: '', gpsLat: '', gpsLng: '', wasteTypes: [], workingHours: '', phone: '', email: '', organization: '', status: 'Работает', notes: '' })

const filteredReception = computed(() => {
  if (!registrySearchQuery.value) return receptionPoints.value
  const q = registrySearchQuery.value.toLowerCase()
  return receptionPoints.value.filter(r => r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q) || r.address.toLowerCase().includes(q))
})

// ==================== RECYCLERS ====================
interface Recycler {
  id: number; name: string; inn: string; address: string; gpsLat: string; gpsLng: string; director: string
  contactPerson: string; phone: string; email: string; activityType: string; wasteTypes: string[]
  capacity: number; licenseNumber: string; licenseExpiry: string; region: string; status: string; notes: string
}

const recyclers = ref<Recycler[]>([
  { id: 1, name: 'ОсОО «ЭкоПереработка»', inn: '01234567891234', address: 'г. Бишкек, ул. Жибек Жолу, 555', gpsLat: '42.8746', gpsLng: '74.5698', director: 'Мамытов Эрлан', contactPerson: 'Кыдыралиева Айгуль', phone: '+996 312 45-67-89', email: 'eco@pererabotka.kg', activityType: 'Переработка пластика', wasteTypes: ['Пластик', 'ПЭТ', 'Полиэтилен'], capacity: 5000, licenseNumber: 'ЛЦ-2024/0156', licenseExpiry: '31.12.2025', region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 2, name: 'ОсОО «СтеклоРесурс»', inn: '01234567891235', address: 'г. Токмок, ул. Промышленная, 12', gpsLat: '42.8412', gpsLng: '75.2856', director: 'Касымов Нурбек', contactPerson: 'Петрова Елена', phone: '+996 3138 2-12-34', email: 'glass@resource.kg', activityType: 'Переработка стекла', wasteTypes: ['Стекло'], capacity: 3000, licenseNumber: 'ЛЦ-2023/0234', licenseExpiry: '31.12.2024', region: 'Чуйская обл.', status: 'Активен', notes: '' },
  { id: 3, name: 'ОсОО «МеталлСервис»', inn: '01234567891236', address: 'г. Бишкек, ул. Ахунбаева, 156', gpsLat: '42.8923', gpsLng: '74.5234', director: 'Асанов Талант', contactPerson: 'Иванов Сергей', phone: '+996 312 56-78-90', email: 'metal@service.kg', activityType: 'Переработка металла', wasteTypes: ['Металл', 'Алюминий'], capacity: 8000, licenseNumber: 'ЛЦ-2022/0089', licenseExpiry: '31.12.2025', region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 4, name: 'ОсОО «Ош-Ресайкл»', inn: '01234567891237', address: 'г. Ош, ул. Курманжан Датки, 45', gpsLat: '40.5283', gpsLng: '72.7985', director: 'Сыдыков Нурлан', contactPerson: 'Асанова Гульмира', phone: '+996 3222 5-12-34', email: 'osh@recycle.kg', activityType: 'Переработка пластика и бумаги', wasteTypes: ['Пластик', 'Бумага'], capacity: 2500, licenseNumber: 'ЛЦ-2023/0145', licenseExpiry: '31.12.2025', region: 'г. Ош', status: 'Активен', notes: '' },
  { id: 5, name: 'ОсОО «ШинПром»', inn: '01234567891238', address: 'г. Ош, ул. Промышленная, 78', gpsLat: '40.5412', gpsLng: '72.8123', director: 'Омуров Бакыт', contactPerson: 'Токтосунова Айжан', phone: '+996 3222 4-56-78', email: 'shin@prom.kg', activityType: 'Переработка шин', wasteTypes: ['Шины'], capacity: 1500, licenseNumber: 'ЛЦ-2024/0078', licenseExpiry: '31.12.2026', region: 'г. Ош', status: 'На проверке', notes: 'Заявка на продление' },
])

const selectedRecycler = ref<Recycler | null>(null)
const recyclerForm = ref<Recycler>({ id: 0, name: '', inn: '', address: '', gpsLat: '', gpsLng: '', director: '', contactPerson: '', phone: '', email: '', activityType: '', wasteTypes: [], capacity: 0, licenseNumber: '', licenseExpiry: '', region: '', status: 'Активен', notes: '' })

const filteredRecyclers = computed(() => {
  if (!registrySearchQuery.value) return recyclers.value
  const q = registrySearchQuery.value.toLowerCase()
  return recyclers.value.filter(r => r.name.toLowerCase().includes(q) || r.inn.includes(q) || r.region.toLowerCase().includes(q))
})

// ==================== PRODUCERS ====================
interface Producer {
  id: number; name: string; inn: string; address: string; gpsLat: string; gpsLng: string; director: string
  contactPerson: string; phone: string; email: string; productType: string; packagingTypes: string[]
  annualVolume: number; region: string; status: string; notes: string
}

const producers = ref<Producer[]>([
  { id: 1, name: 'ОсОО «Кока-Кола Бишкек Ботлерс»', inn: '01234567891301', address: 'г. Бишкек, ул. Фучика, 14/1', gpsLat: '42.8345', gpsLng: '74.5567', director: 'Иванов Петр', contactPerson: 'Сидорова Анна', phone: '+996 312 54-32-10', email: 'info@coca-cola.kg', productType: 'Производство напитков', packagingTypes: ['ПЭТ-бутылки', 'Алюминиевые банки'], annualVolume: 50000, region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 2, name: 'ОАО «Бишкексут»', inn: '01234567891302', address: 'г. Бишкек, ул. Фрунзе, 480', gpsLat: '42.8567', gpsLng: '74.5234', director: 'Асанов Кубат', contactPerson: 'Жумабаева Айгуль', phone: '+996 312 43-21-09', email: 'info@bishkeksut.kg', productType: 'Молочная продукция', packagingTypes: ['ПЭТ-бутылки', 'Тетрапак', 'Пластиковые стаканы'], annualVolume: 25000, region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 3, name: 'ОсОО «Шоро»', inn: '01234567891303', address: 'г. Бишкек, ул. Ибраимова, 29', gpsLat: '42.8789', gpsLng: '74.5890', director: 'Эгембердиева Жылдыз', contactPerson: 'Токтосунов Азамат', phone: '+996 312 32-10-98', email: 'info@shoro.kg', productType: 'Производство напитков', packagingTypes: ['ПЭТ-бутылки', 'Стеклянные бутылки'], annualVolume: 15000, region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 4, name: 'ОсОО «Арпа»', inn: '01234567891304', address: 'г. Бишкек, ул. Льва Толстого, 36', gpsLat: '42.8123', gpsLng: '74.6012', director: 'Касымов Эрнис', contactPerson: 'Бейшенова Айжан', phone: '+996 312 21-09-87', email: 'info@arpa.kg', productType: 'Пивоваренная компания', packagingTypes: ['Стеклянные бутылки', 'Алюминиевые банки', 'ПЭТ-бутылки'], annualVolume: 35000, region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 5, name: 'ОсОО «Южный пластик»', inn: '01234567891305', address: 'г. Ош, ул. Промышленная, 12', gpsLat: '40.5345', gpsLng: '72.7789', director: 'Мамытов Бакыт', contactPerson: 'Асанова Динара', phone: '+996 3222 3-45-67', email: 'south@plastic.kg', productType: 'Производство пластиковой тары', packagingTypes: ['ПЭТ-бутылки', 'Пластиковые контейнеры'], annualVolume: 8000, region: 'г. Ош', status: 'На проверке', notes: '' },
])

const selectedProducer = ref<Producer | null>(null)
const producerForm = ref<Producer>({ id: 0, name: '', inn: '', address: '', gpsLat: '', gpsLng: '', director: '', contactPerson: '', phone: '', email: '', productType: '', packagingTypes: [], annualVolume: 0, region: '', status: 'Активен', notes: '' })

const filteredProducers = computed(() => {
  if (!registrySearchQuery.value) return producers.value
  const q = registrySearchQuery.value.toLowerCase()
  return producers.value.filter(p => p.name.toLowerCase().includes(q) || p.inn.includes(q) || p.region.toLowerCase().includes(q))
})

// ==================== DUMPS ====================
interface Dump {
  id: number; name: string; region: string; address: string; gpsLat: string; gpsLng: string
  area: number; discoveryDate: string; dumpStatus: string; notes: string
}

const dumps = ref<Dump[]>([
  { id: 41, name: 'Свалка у р. Аламедин', region: 'Чуйская обл.', address: 'берег р. Аламедин', gpsLat: '42.9456', gpsLng: '74.5123', area: 2.5, discoveryDate: '15.03.2024', dumpStatus: 'Ликвидируется', notes: 'Бытовые и строительные отходы' },
  { id: 42, name: 'Свалка «Токмок»', region: 'Чуйская обл.', address: 'окрестности г. Токмок', gpsLat: '42.8567', gpsLng: '75.3123', area: 8.0, discoveryDate: '20.06.2018', dumpStatus: 'Ликвидируется', notes: 'Крупная стихийная свалка' },
  { id: 43, name: 'Свалка у трассы Бишкек–Ош', region: 'Чуйская обл.', address: 'вдоль трассы, км 45', gpsLat: '42.6234', gpsLng: '74.3567', area: 1.2, discoveryDate: '10.08.2024', dumpStatus: 'Обнаружена', notes: 'Пластик и строительный мусор' },
  { id: 44, name: 'Свалка у с. Кара-Балта', region: 'Чуйская обл.', address: 'Жайылский р-н', gpsLat: '42.8123', gpsLng: '73.8456', area: 3.0, discoveryDate: '05.11.2023', dumpStatus: 'Ликвидирована', notes: 'Рекультивация завершена' },
  { id: 45, name: 'Свалка у оз. Иссык-Куль', region: 'Иссык-Кульская обл.', address: 'южный берег озера', gpsLat: '42.5012', gpsLng: '77.3456', area: 0.8, discoveryDate: '22.05.2024', dumpStatus: 'Ликвидируется', notes: 'Курортная зона, приоритет' },
  { id: 46, name: 'Свалка в пригороде Ош', region: 'Ошская обл.', address: 'Кара-Сууйский р-н', gpsLat: '40.4812', gpsLng: '72.6789', area: 5.2, discoveryDate: '03.02.2023', dumpStatus: 'Ликвидируется', notes: 'Смешанные отходы, рядом жилмассив' },
  { id: 47, name: 'Свалка у Кызыл-Кия', region: 'Баткенская обл.', address: 'г. Кызыл-Кия', gpsLat: '40.2567', gpsLng: '72.1234', area: 2.0, discoveryDate: '18.07.2024', dumpStatus: 'Обнаружена', notes: 'Строительные и промышленные отходы' },
  { id: 48, name: 'Свалка у Майлуу-Суу', region: 'Джалал-Абадская обл.', address: 'г. Майлуу-Суу', gpsLat: '41.2623', gpsLng: '72.4512', area: 3.5, discoveryDate: '12.01.2022', dumpStatus: 'Ликвидирована', notes: 'Радиоактивные хвосты' },
  { id: 49, name: 'Свалка у с. Кочкорка', region: 'Нарынская обл.', address: 'Кочкорский р-н', gpsLat: '42.0234', gpsLng: '75.7567', area: 1.8, discoveryDate: '07.10.2024', dumpStatus: 'Обнаружена', notes: 'Бытовые отходы' },
  { id: 50, name: 'Свалка у р. Талас', region: 'Таласская обл.', address: 'пойма р. Талас', gpsLat: '42.5512', gpsLng: '72.1823', area: 1.0, discoveryDate: '19.06.2024', dumpStatus: 'Ликвидируется', notes: 'Сельскохозяйственные отходы' },
])

const selectedDump = ref<Dump | null>(null)
const dumpForm = ref<Dump>({ id: 0, name: '', region: '', address: '', gpsLat: '', gpsLng: '', area: 0, discoveryDate: '', dumpStatus: 'Обнаружена', notes: '' })

const filteredDumps = computed(() => {
  if (!registrySearchQuery.value) return dumps.value
  const q = registrySearchQuery.value.toLowerCase()
  return dumps.value.filter(d => d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q))
})

// ==================== PAYERS ====================
interface Payer {
  id: number; name: string; inn: string; region: string; address: string; gpsLat: string; gpsLng: string
  phone: string; category: string; calcStatus: string
}

const payers = ref<Payer[]>([
  { id: 61, name: 'ОсОО «Кока-Кола Бишкек Ботлерс»', inn: '02907202010020', region: 'г. Бишкек', address: 'ул. Фучика, 14/1', gpsLat: '42.8345', gpsLng: '74.5567', phone: '+996 312 54-32-10', category: 'Крупный импортёр', calcStatus: 'Оплачен' },
  { id: 62, name: 'ОАО «Бишкексут»', inn: '01204200010399', region: 'г. Бишкек', address: 'ул. Фрунзе, 480', gpsLat: '42.8567', gpsLng: '74.5234', phone: '+996 312 43-21-09', category: 'Производитель', calcStatus: 'Оплачен' },
  { id: 63, name: 'ОсОО «Шоро»', inn: '02406200210072', region: 'г. Бишкек', address: 'ул. Ибраимова, 29', gpsLat: '42.8789', gpsLng: '74.5890', phone: '+996 312 32-10-98', category: 'Производитель', calcStatus: 'На проверке' },
  { id: 64, name: 'ОсОО «Арпа»', inn: '02502200310045', region: 'г. Бишкек', address: 'ул. Льва Толстого, 36', gpsLat: '42.8123', gpsLng: '74.6012', phone: '+996 312 21-09-87', category: 'Производитель', calcStatus: 'Оплачен' },
  { id: 65, name: 'ОсОО «Южный Пластик»', inn: '12308200110089', region: 'г. Ош', address: 'ул. Промышленная, 12', gpsLat: '40.5345', gpsLng: '72.7789', phone: '+996 3222 3-45-67', category: 'Производитель', calcStatus: 'Просрочен' },
  { id: 66, name: 'ОсОО «ИнтерГласс»', inn: '02309200410156', region: 'Чуйская обл.', address: 'г. Токмок, ул. Промышленная, 25', gpsLat: '42.8234', gpsLng: '75.2789', phone: '+996 3138 8-76-54', category: 'Производитель', calcStatus: 'Оплачен' },
  { id: 67, name: 'ОсОО «Азия Фуд»', inn: '02410200510234', region: 'г. Бишкек', address: 'ул. Жибек Жолу, 498', gpsLat: '42.8456', gpsLng: '74.6234', phone: '+996 312 10-98-76', category: 'Импортёр', calcStatus: 'На проверке' },
  { id: 68, name: 'ОсОО «ЭнергоПром»', inn: '02511200610312', region: 'г. Бишкек', address: 'ул. Сухэ-Батора, 5', gpsLat: '42.8678', gpsLng: '74.5012', phone: '+996 312 09-87-65', category: 'Импортёр', calcStatus: 'Оплачен' },
])

const selectedPayer = ref<Payer | null>(null)
const payerForm = ref<Payer>({ id: 0, name: '', inn: '', region: '', address: '', gpsLat: '', gpsLng: '', phone: '', category: '', calcStatus: '' })

const filteredPayers = computed(() => {
  if (!registrySearchQuery.value) return payers.value
  const q = registrySearchQuery.value.toLowerCase()
  return payers.value.filter(p => p.name.toLowerCase().includes(q) || p.inn.includes(q) || p.region.toLowerCase().includes(q))
})

// ==================== MAP POINTS FROM REGISTRY DATA ====================
const allMapPoints = computed<MapPoint[]>(() => {
  const points: MapPoint[] = []

  landfills.value.forEach(l => {
    if (l.gpsLat && l.gpsLng) {
      points.push({
        id: l.id, type: 'landfills', name: l.name, lat: parseFloat(l.gpsLat), lng: parseFloat(l.gpsLng),
        address: l.address || l.region, phone: '', status: l.status, description: l.notes
      })
    }
  })

  receptionPoints.value.forEach(r => {
    if (r.gpsLat && r.gpsLng) {
      points.push({
        id: r.id, type: 'reception', name: r.name, lat: parseFloat(r.gpsLat), lng: parseFloat(r.gpsLng),
        address: r.address, phone: r.phone, status: r.status, description: r.notes
      })
    }
  })

  recyclers.value.forEach(r => {
    if (r.gpsLat && r.gpsLng) {
      points.push({
        id: r.id, type: 'recyclers', name: r.name, lat: parseFloat(r.gpsLat), lng: parseFloat(r.gpsLng),
        address: r.address, phone: r.phone, status: r.status, description: r.activityType
      })
    }
  })

  producers.value.forEach(p => {
    if (p.gpsLat && p.gpsLng) {
      points.push({
        id: p.id, type: 'recyclers' as LayerType, name: p.name, lat: parseFloat(p.gpsLat), lng: parseFloat(p.gpsLng),
        address: p.address, phone: p.phone, status: p.status, description: p.productType
      })
    }
  })

  dumps.value.forEach(d => {
    if (d.gpsLat && d.gpsLng) {
      points.push({
        id: d.id, type: 'dumps', name: d.name, lat: parseFloat(d.gpsLat), lng: parseFloat(d.gpsLng),
        address: d.address || d.region, phone: '', status: d.dumpStatus, description: d.notes
      })
    }
  })

  payers.value.forEach(p => {
    if (p.gpsLat && p.gpsLng) {
      points.push({
        id: p.id, type: 'payers', name: p.name, lat: parseFloat(p.gpsLat), lng: parseFloat(p.gpsLng),
        address: p.address, phone: p.phone, status: p.calcStatus, description: p.category
      })
    }
  })

  return points
})

const visiblePoints = computed(() => {
  return allMapPoints.value.filter(point => {
    const layer = layers.value.find(l => l.id === point.type)
    return layer?.visible
  })
})

// ==================== MAP FUNCTIONS ====================
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
  })
}

const getMarkerIcon = (type: LayerType) => {
  const layer = layers.value.find(l => l.id === type)
  return createIcon(layer?.color || '#666')
}

const getStatusInfo = (status: string) => {
  const map: Record<string, { label: string; color: string }> = {
    'Активен': { label: 'Активен', color: 'bg-green-100 text-green-700' },
    'Работает': { label: 'Работает', color: 'bg-green-100 text-green-700' },
    'Закрыт': { label: 'Закрыт', color: 'bg-gray-100 text-gray-700' },
    'Временно закрыт': { label: 'Временно закрыт', color: 'bg-yellow-100 text-yellow-700' },
    'На проверке': { label: 'На проверке', color: 'bg-yellow-100 text-yellow-700' },
    'На реконструкции': { label: 'На реконструкции', color: 'bg-blue-100 text-blue-700' },
    'Обнаружена': { label: 'Обнаружена', color: 'bg-red-100 text-red-700' },
    'Ликвидируется': { label: 'Ликвидируется', color: 'bg-orange-100 text-orange-700' },
    'Ликвидирована': { label: 'Ликвидирована', color: 'bg-green-100 text-green-700' },
    'Оплачен': { label: 'Оплачен', color: 'bg-green-100 text-green-700' },
    'Просрочен': { label: 'Просрочен', color: 'bg-red-100 text-red-700' },
  }
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
}

const getTypeLabel = (type: LayerType) => {
  const layer = layers.value.find(l => l.id === type)
  return layer?.name || type
}

const toggleLayer = (layerId: LayerType) => {
  const layer = layers.value.find(l => l.id === layerId)
  if (layer) layer.visible = !layer.visible
}

const performMapSearch = () => {
  if (!mapSearchQuery.value.trim()) {
    mapSearchResults.value = []
    showMapSearchResults.value = false
    return
  }
  const query = mapSearchQuery.value.toLowerCase()
  mapSearchResults.value = allMapPoints.value.filter(point =>
    point.name.toLowerCase().includes(query) || point.address.toLowerCase().includes(query)
  ).slice(0, 10)
  showMapSearchResults.value = mapSearchResults.value.length > 0
}

watch(mapSearchQuery, performMapSearch)

// Go to point on map (used by map search and table row clicks)
const goToMapPoint = (point: MapPoint) => {
  mapCenter.value = [point.lat, point.lng]
  mapZoom.value = 14
  showMapSearchResults.value = false
  mapSearchQuery.value = point.name

  const layer = layers.value.find(l => l.id === point.type)
  if (layer && !layer.visible) layer.visible = true
}

// Click on table row to go to map
const onTableRowClick = (item: any, type: LayerType) => {
  if (item.gpsLat && item.gpsLng) {
    const lat = parseFloat(item.gpsLat)
    const lng = parseFloat(item.gpsLng)
    if (!isNaN(lat) && !isNaN(lng)) {
      mapCenter.value = [lat, lng]
      mapZoom.value = 14
      const layer = layers.value.find(l => l.id === type)
      if (layer && !layer.visible) layer.visible = true

      // Scroll to map
      nextTick(() => {
        document.querySelector('.map-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }
}

// ==================== REGISTRY CRUD FUNCTIONS ====================
const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'Активен': 'bg-green-100 text-green-700', 'Работает': 'bg-green-100 text-green-700',
    'Закрыт': 'bg-gray-100 text-gray-700', 'Временно закрыт': 'bg-yellow-100 text-yellow-700',
    'На проверке': 'bg-yellow-100 text-yellow-700', 'На реконструкции': 'bg-blue-100 text-blue-700',
    'Приостановлен': 'bg-red-100 text-red-700', 'Рекультивирован': 'bg-teal-100 text-teal-700',
    'Обнаружена': 'bg-red-100 text-red-700',
    'Ликвидируется': 'bg-orange-100 text-orange-700',
    'Ликвидирована': 'bg-green-100 text-green-700',
    'Оплачен': 'bg-green-100 text-green-700',
    'Просрочен': 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const openView = (item: any) => {
  if (activeRegistry.value === 'landfills') selectedLandfill.value = item
  else if (activeRegistry.value === 'reception') selectedReception.value = item
  else if (activeRegistry.value === 'recyclers') selectedRecycler.value = item
  else if (activeRegistry.value === 'producers') selectedProducer.value = item
  else if (activeRegistry.value === 'dumps') selectedDump.value = item
  else if (activeRegistry.value === 'payers') selectedPayer.value = item
  showViewModal.value = true
}

const openEdit = (item: any) => {
  isCreating.value = false
  if (activeRegistry.value === 'landfills') { landfillForm.value = { ...item }; selectedLandfill.value = item }
  else if (activeRegistry.value === 'reception') { receptionForm.value = { ...item }; selectedReception.value = item }
  else if (activeRegistry.value === 'recyclers') { recyclerForm.value = { ...item }; selectedRecycler.value = item }
  else if (activeRegistry.value === 'producers') { producerForm.value = { ...item }; selectedProducer.value = item }
  else if (activeRegistry.value === 'dumps') { dumpForm.value = { ...item }; selectedDump.value = item }
  else if (activeRegistry.value === 'payers') { payerForm.value = { ...item }; selectedPayer.value = item }
  showEditModal.value = true
}

const openCreate = () => {
  isCreating.value = true
  if (activeRegistry.value === 'landfills') {
    landfillForm.value = { id: Math.max(0, ...landfills.value.map(l => l.id)) + 1, name: '', region: '', district: '', type: 'Санкционированный', area: 0, volume: 0, wasteTypes: [], gpsLat: '', gpsLng: '', address: '', organization: '', discoveryDate: '', status: 'Активен', photo: '', notes: '' }
  } else if (activeRegistry.value === 'reception') {
    receptionForm.value = { id: Math.max(0, ...receptionPoints.value.map(r => r.id)) + 1, name: '', region: '', district: '', address: '', gpsLat: '', gpsLng: '', wasteTypes: [], workingHours: '', phone: '', email: '', organization: '', status: 'Работает', notes: '' }
  } else if (activeRegistry.value === 'recyclers') {
    recyclerForm.value = { id: Math.max(0, ...recyclers.value.map(r => r.id)) + 1, name: '', inn: '', address: '', gpsLat: '', gpsLng: '', director: '', contactPerson: '', phone: '', email: '', activityType: '', wasteTypes: [], capacity: 0, licenseNumber: '', licenseExpiry: '', region: '', status: 'Активен', notes: '' }
  } else if (activeRegistry.value === 'producers') {
    producerForm.value = { id: Math.max(0, ...producers.value.map(p => p.id)) + 1, name: '', inn: '', address: '', gpsLat: '', gpsLng: '', director: '', contactPerson: '', phone: '', email: '', productType: '', packagingTypes: [], annualVolume: 0, region: '', status: 'Активен', notes: '' }
  } else if (activeRegistry.value === 'dumps') {
    dumpForm.value = { id: Math.max(0, ...dumps.value.map(d => d.id)) + 1, name: '', region: '', address: '', gpsLat: '', gpsLng: '', area: 0, discoveryDate: '', dumpStatus: 'Обнаружена', notes: '' }
  } else if (activeRegistry.value === 'payers') {
    payerForm.value = { id: Math.max(0, ...payers.value.map(p => p.id)) + 1, name: '', inn: '', region: '', address: '', gpsLat: '', gpsLng: '', phone: '', category: '', calcStatus: '' }
  }
  showEditModal.value = true
}

const openDelete = (item: any) => {
  if (activeRegistry.value === 'landfills') selectedLandfill.value = item
  else if (activeRegistry.value === 'reception') selectedReception.value = item
  else if (activeRegistry.value === 'recyclers') selectedRecycler.value = item
  else if (activeRegistry.value === 'producers') selectedProducer.value = item
  else if (activeRegistry.value === 'dumps') selectedDump.value = item
  else if (activeRegistry.value === 'payers') selectedPayer.value = item
  showDeleteConfirm.value = true
}

const saveItem = () => {
  if (activeRegistry.value === 'landfills') {
    if (isCreating.value) landfills.value.push({ ...landfillForm.value })
    else { const idx = landfills.value.findIndex(l => l.id === landfillForm.value.id); if (idx !== -1) landfills.value[idx] = { ...landfillForm.value } }
  } else if (activeRegistry.value === 'reception') {
    if (isCreating.value) receptionPoints.value.push({ ...receptionForm.value })
    else { const idx = receptionPoints.value.findIndex(r => r.id === receptionForm.value.id); if (idx !== -1) receptionPoints.value[idx] = { ...receptionForm.value } }
  } else if (activeRegistry.value === 'recyclers') {
    if (isCreating.value) recyclers.value.push({ ...recyclerForm.value })
    else { const idx = recyclers.value.findIndex(r => r.id === recyclerForm.value.id); if (idx !== -1) recyclers.value[idx] = { ...recyclerForm.value } }
  } else if (activeRegistry.value === 'producers') {
    if (isCreating.value) producers.value.push({ ...producerForm.value })
    else { const idx = producers.value.findIndex(p => p.id === producerForm.value.id); if (idx !== -1) producers.value[idx] = { ...producerForm.value } }
  } else if (activeRegistry.value === 'dumps') {
    if (isCreating.value) dumps.value.push({ ...dumpForm.value })
    else { const idx = dumps.value.findIndex(d => d.id === dumpForm.value.id); if (idx !== -1) dumps.value[idx] = { ...dumpForm.value } }
  } else if (activeRegistry.value === 'payers') {
    if (isCreating.value) payers.value.push({ ...payerForm.value })
    else { const idx = payers.value.findIndex(p => p.id === payerForm.value.id); if (idx !== -1) payers.value[idx] = { ...payerForm.value } }
  }
  showEditModal.value = false
  notificationMessage.value = isCreating.value ? 'Запись успешно создана' : 'Данные обновлены'
  showNotification.value = true
  setTimeout(() => { showNotification.value = false }, 3000)
}

const deleteItem = () => {
  if (activeRegistry.value === 'landfills' && selectedLandfill.value) landfills.value = landfills.value.filter(l => l.id !== selectedLandfill.value!.id)
  else if (activeRegistry.value === 'reception' && selectedReception.value) receptionPoints.value = receptionPoints.value.filter(r => r.id !== selectedReception.value!.id)
  else if (activeRegistry.value === 'recyclers' && selectedRecycler.value) recyclers.value = recyclers.value.filter(r => r.id !== selectedRecycler.value!.id)
  else if (activeRegistry.value === 'producers' && selectedProducer.value) producers.value = producers.value.filter(p => p.id !== selectedProducer.value!.id)
  else if (activeRegistry.value === 'dumps' && selectedDump.value) dumps.value = dumps.value.filter(d => d.id !== selectedDump.value!.id)
  else if (activeRegistry.value === 'payers' && selectedPayer.value) payers.value = payers.value.filter(p => p.id !== selectedPayer.value!.id)
  showDeleteConfirm.value = false
  notificationMessage.value = 'Запись удалена'
  showNotification.value = true
  setTimeout(() => { showNotification.value = false }, 3000)
}

const toggleWasteType = (form: any, type: string) => {
  const key = 'wasteTypes' in form ? 'wasteTypes' : 'packagingTypes'
  const idx = form[key].indexOf(type)
  if (idx === -1) form[key].push(type)
  else form[key].splice(idx, 1)
}

const getSelectedItemName = () => {
  if (activeRegistry.value === 'landfills') return selectedLandfill.value?.name
  if (activeRegistry.value === 'reception') return selectedReception.value?.name
  if (activeRegistry.value === 'recyclers') return selectedRecycler.value?.name
  if (activeRegistry.value === 'producers') return selectedProducer.value?.name
  if (activeRegistry.value === 'dumps') return selectedDump.value?.name
  if (activeRegistry.value === 'payers') return selectedPayer.value?.name
  return ''
}

const getRegistryAddButtonText = () => {
  return t('common.add')
}

const countByType = computed(() => ({
  landfills: landfills.value.length,
  reception: receptionPoints.value.length,
  recyclers: recyclers.value.length,
  producers: producers.value.length,
  dumps: dumps.value.length,
  payers: payers.value.length,
  total: allMapPoints.value.length,
}))
</script>

<template>
  <DashboardLayout role="employee" :roleTitle="roleTitle" userName="Мамытова Айгуль" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('pages.employee.mapTitle') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('pages.employee.mapSubtitle') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toastStore.show({ type: 'info', title: 'Экспорт данных карты', message: 'Функция в разработке' })" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {{ $t('common.export') }}
          </button>
          <button @click="openCreate" class="px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            {{ getRegistryAddButtonText() }}
          </button>
        </div>
      </div>

      <!-- Horizontal Filter Bar -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div class="flex items-center gap-3 px-4 py-3 flex-wrap">
          <!-- Search -->
          <div class="relative w-[220px] flex-shrink-0">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              v-model="mapSearchQuery"
              type="text"
              placeholder="Поиск объекта..."
              class="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              @focus="showMapSearchResults = mapSearchResults.length > 0"
              @blur="setTimeout(() => showMapSearchResults = false, 200)"
            />
            <div v-if="showMapSearchResults" class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50">
              <div v-for="result in mapSearchResults" :key="`${result.type}-${result.id}`" @mousedown.prevent="goToMapPoint(result)" class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: layers.find(l => l.id === result.type)?.color }"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ result.name }}</p>
                    <p class="text-[11px] text-gray-500 truncate">{{ result.address }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="w-px h-7 bg-gray-200 flex-shrink-0"></div>

          <!-- Layer type chips -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-for="layer in layers"
              :key="layer.id"
              @click="toggleLayer(layer.id)"
              :class="[
                'flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium transition-all border',
                layer.visible
                  ? 'bg-white border-current shadow-sm'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              ]"
              :style="layer.visible ? { color: layer.color, borderColor: layer.color } : {}"
            >
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: layer.visible ? layer.color : '#d1d5db' }"></span>
              <span class="whitespace-nowrap">{{ layer.name }}</span>
              <span class="text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
                :style="layer.visible ? { backgroundColor: layer.color + '1a', color: layer.color } : { backgroundColor: '#e5e7eb', color: '#6b7280' }"
              >{{ countByType[layer.id] }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="relative" style="height: calc(100vh - 360px); min-height: 350px; max-height: 600px;">
          <LMap ref="mapRef" :zoom="mapZoom" :center="mapCenter" :use-global-leaflet="false" class="h-full w-full z-0">
            <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' layer-type="base" name="OpenStreetMap" />
            <LMarker v-for="point in visiblePoints" :key="`${point.type}-${point.id}`" :lat-lng="[point.lat, point.lng]" :icon="getMarkerIcon(point.type)">
              <LPopup :options="{ maxWidth: 300 }">
                <div class="min-w-[220px]">
                  <div class="flex items-start justify-between mb-2">
                    <h4 class="font-semibold text-gray-900 text-sm pr-2">{{ point.name }}</h4>
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', getStatusInfo(point.status).color]">{{ getStatusInfo(point.status).label }}</span>
                  </div>
                  <div class="space-y-1 text-xs">
                    <p class="flex items-start gap-2"><span class="text-gray-400">Тип:</span><span class="text-gray-700">{{ getTypeLabel(point.type) }}</span></p>
                    <p class="flex items-start gap-2"><span class="text-gray-400">Адрес:</span><span class="text-gray-700">{{ point.address }}</span></p>
                    <p v-if="point.phone" class="flex items-start gap-2"><span class="text-gray-400">Тел:</span><span class="text-gray-700">{{ point.phone }}</span></p>
                    <p v-if="point.description" class="flex items-start gap-2"><span class="text-gray-400">Инфо:</span><span class="text-gray-700">{{ point.description }}</span></p>
                  </div>
                </div>
              </LPopup>
            </LMarker>
          </LMap>

          <!-- Legend -->
          <div class="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-gray-200/60 px-3 py-2.5 z-[1000]">
            <div class="space-y-1.5">
              <div v-for="layer in layers" :key="layer.id" class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: layer.color }"></div>
                <span class="text-[12px] text-gray-600 whitespace-nowrap">{{ layer.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Registry Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div class="flex flex-wrap gap-2">
          <button v-for="reg in registries" :key="reg.id" @click="activeRegistry = reg.id; registrySearchQuery = ''" :class="['px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2', activeRegistry === reg.id ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:bg-gray-100']">
            <span>{{ reg.icon }}</span>
            <span>{{ reg.name }}</span>
            <span class="px-1.5 py-0.5 text-xs rounded-full" :class="activeRegistry === reg.id ? 'bg-sky-200' : 'bg-gray-200'">{{ countByType[reg.id] }}</span>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="registrySearchQuery" type="text" :placeholder="$t('common.search')" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
        </div>
      </div>

      <!-- LANDFILLS TABLE -->
      <div v-if="activeRegistry === 'landfills'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">Реестр полигонов и свалок</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Название</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Тип</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Площадь</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredLandfills" :key="item.id" @click="onTableRowClick(item, 'landfills')" class="hover:bg-sky-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm"><span :class="item.type === 'Санкционированный' ? 'text-green-600' : 'text-red-600'">{{ item.type }}</span></td>
                <td class="px-4 py-3 text-sm text-right text-gray-900">{{ item.area }} га</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>Просмотр</button>
                    <button @click="openEdit(item)" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Изменить</button>
                    <button @click="openDelete(item)" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>{{ $t('common.delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECEPTION TABLE -->
      <div v-if="activeRegistry === 'reception'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">Реестр пунктов приёма</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Название</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Адрес</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Виды отходов</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredReception" :key="item.id" @click="onTableRowClick(item, 'reception')" class="hover:bg-sky-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.address }}</td>
                <td class="px-4 py-3"><div class="flex flex-wrap gap-1"><span v-for="wt in item.wasteTypes.slice(0, 3)" :key="wt" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ wt }}</span><span v-if="item.wasteTypes.length > 3" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">+{{ item.wasteTypes.length - 3 }}</span></div></td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" class="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button @click="openDelete(item)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECYCLERS TABLE -->
      <div v-if="activeRegistry === 'recyclers'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">Реестр переработчиков</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Наименование</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ИНН</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Вид деятельности</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredRecyclers" :key="item.id" @click="onTableRowClick(item, 'recyclers')" class="hover:bg-sky-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-600">{{ item.inn }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.activityType }}</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" class="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button @click="openDelete(item)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PRODUCERS TABLE -->
      <div v-if="activeRegistry === 'producers'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">Реестр производителей</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Наименование</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ИНН</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Вид продукции</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredProducers" :key="item.id" @click="onTableRowClick(item, 'producers')" class="hover:bg-sky-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-600">{{ item.inn }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.productType }}</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" class="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button @click="openDelete(item)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DUMPS TABLE -->
      <div v-if="activeRegistry === 'dumps'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">Реестр несанкционированных свалок</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Название</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Площадь (га)</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Дата обнаружения</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredDumps" :key="item.id" @click="onTableRowClick(item, 'dumps')" class="hover:bg-red-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-900">{{ item.area }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.discoveryDate }}</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.dumpStatus)]">{{ item.dumpStatus }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">Просмотр</button>
                    <button @click="openEdit(item)" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm">Изменить</button>
                    <button @click="openDelete(item)" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm">Удалить</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAYERS TABLE -->
      <div v-if="activeRegistry === 'payers'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">Реестр плательщиков утильсбора</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Наименование</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ИНН</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Категория</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус расчётов</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredPayers" :key="item.id" @click="onTableRowClick(item, 'payers')" class="hover:bg-purple-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 font-mono">{{ item.inn }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.category }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.calcStatus)]">{{ item.calcStatus }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">Просмотр</button>
                    <button @click="openEdit(item)" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm">Изменить</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <Teleport to="body">
      <div v-if="showViewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Просмотр записи</h3>
            <button @click="showViewModal = false" class="p-2 text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
            <!-- Landfill view -->
            <div v-if="activeRegistry === 'landfills' && selectedLandfill" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-sm text-gray-500">Название</label><p class="font-medium">{{ selectedLandfill.name }}</p></div>
                <div><label class="text-sm text-gray-500">Статус</label><p><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(selectedLandfill.status)]">{{ selectedLandfill.status }}</span></p></div>
                <div><label class="text-sm text-gray-500">Регион</label><p>{{ selectedLandfill.region }}</p></div>
                <div><label class="text-sm text-gray-500">Район</label><p>{{ selectedLandfill.district }}</p></div>
                <div><label class="text-sm text-gray-500">Тип</label><p>{{ selectedLandfill.type }}</p></div>
                <div><label class="text-sm text-gray-500">Площадь</label><p>{{ selectedLandfill.area }} га</p></div>
                <div><label class="text-sm text-gray-500">Объём</label><p>{{ selectedLandfill.volume?.toLocaleString() }} т</p></div>
                <div><label class="text-sm text-gray-500">Организация</label><p>{{ selectedLandfill.organization || '—' }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">Адрес</label><p>{{ selectedLandfill.address }}</p></div>
                <div><label class="text-sm text-gray-500">GPS</label><p class="font-mono text-sm">{{ selectedLandfill.gpsLat }}, {{ selectedLandfill.gpsLng }}</p></div>
                <div><label class="text-sm text-gray-500">Дата обнаружения</label><p>{{ selectedLandfill.discoveryDate || '—' }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">Виды отходов</label><div class="flex flex-wrap gap-1 mt-1"><span v-for="wt in selectedLandfill.wasteTypes" :key="wt" class="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">{{ wt }}</span></div></div>
                <div class="col-span-2" v-if="selectedLandfill.notes"><label class="text-sm text-gray-500">Примечания</label><p>{{ selectedLandfill.notes }}</p></div>
              </div>
            </div>
            <!-- Reception view -->
            <div v-if="activeRegistry === 'reception' && selectedReception" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-sm text-gray-500">Название</label><p class="font-medium">{{ selectedReception.name }}</p></div>
                <div><label class="text-sm text-gray-500">Статус</label><p><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(selectedReception.status)]">{{ selectedReception.status }}</span></p></div>
                <div><label class="text-sm text-gray-500">Регион</label><p>{{ selectedReception.region }}</p></div>
                <div><label class="text-sm text-gray-500">Район</label><p>{{ selectedReception.district }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">Адрес</label><p>{{ selectedReception.address }}</p></div>
                <div><label class="text-sm text-gray-500">Режим работы</label><p>{{ selectedReception.workingHours }}</p></div>
                <div><label class="text-sm text-gray-500">Телефон</label><p>{{ selectedReception.phone }}</p></div>
                <div><label class="text-sm text-gray-500">Email</label><p>{{ selectedReception.email }}</p></div>
                <div><label class="text-sm text-gray-500">Организация</label><p>{{ selectedReception.organization }}</p></div>
                <div><label class="text-sm text-gray-500">GPS</label><p class="font-mono text-sm">{{ selectedReception.gpsLat }}, {{ selectedReception.gpsLng }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">Виды отходов</label><div class="flex flex-wrap gap-1 mt-1"><span v-for="wt in selectedReception.wasteTypes" :key="wt" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{{ wt }}</span></div></div>
              </div>
            </div>
            <!-- Recycler view -->
            <div v-if="activeRegistry === 'recyclers' && selectedRecycler" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-sm text-gray-500">Наименование</label><p class="font-medium">{{ selectedRecycler.name }}</p></div>
                <div><label class="text-sm text-gray-500">Статус</label><p><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(selectedRecycler.status)]">{{ selectedRecycler.status }}</span></p></div>
                <div><label class="text-sm text-gray-500">ИНН</label><p class="font-mono">{{ selectedRecycler.inn }}</p></div>
                <div><label class="text-sm text-gray-500">Регион</label><p>{{ selectedRecycler.region }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">Адрес</label><p>{{ selectedRecycler.address }}</p></div>
                <div><label class="text-sm text-gray-500">Директор</label><p>{{ selectedRecycler.director }}</p></div>
                <div><label class="text-sm text-gray-500">Контактное лицо</label><p>{{ selectedRecycler.contactPerson }}</p></div>
                <div><label class="text-sm text-gray-500">Телефон</label><p>{{ selectedRecycler.phone }}</p></div>
                <div><label class="text-sm text-gray-500">Email</label><p>{{ selectedRecycler.email }}</p></div>
                <div><label class="text-sm text-gray-500">Вид деятельности</label><p>{{ selectedRecycler.activityType }}</p></div>
                <div><label class="text-sm text-gray-500">Мощность</label><p>{{ selectedRecycler.capacity?.toLocaleString() }} т/год</p></div>
                <div><label class="text-sm text-gray-500">Лицензия</label><p class="font-mono text-sky-600">{{ selectedRecycler.licenseNumber }}</p></div>
                <div><label class="text-sm text-gray-500">Срок действия</label><p>{{ selectedRecycler.licenseExpiry }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">Виды отходов</label><div class="flex flex-wrap gap-1 mt-1"><span v-for="wt in selectedRecycler.wasteTypes" :key="wt" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{{ wt }}</span></div></div>
              </div>
            </div>
            <!-- Producer view -->
            <div v-if="activeRegistry === 'producers' && selectedProducer" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-sm text-gray-500">Наименование</label><p class="font-medium">{{ selectedProducer.name }}</p></div>
                <div><label class="text-sm text-gray-500">Статус</label><p><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(selectedProducer.status)]">{{ selectedProducer.status }}</span></p></div>
                <div><label class="text-sm text-gray-500">ИНН</label><p class="font-mono">{{ selectedProducer.inn }}</p></div>
                <div><label class="text-sm text-gray-500">Регион</label><p>{{ selectedProducer.region }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">Адрес</label><p>{{ selectedProducer.address }}</p></div>
                <div><label class="text-sm text-gray-500">Директор</label><p>{{ selectedProducer.director }}</p></div>
                <div><label class="text-sm text-gray-500">Контактное лицо</label><p>{{ selectedProducer.contactPerson }}</p></div>
                <div><label class="text-sm text-gray-500">Телефон</label><p>{{ selectedProducer.phone }}</p></div>
                <div><label class="text-sm text-gray-500">Email</label><p>{{ selectedProducer.email }}</p></div>
                <div><label class="text-sm text-gray-500">Вид продукции</label><p>{{ selectedProducer.productType }}</p></div>
                <div><label class="text-sm text-gray-500">Годовой объём</label><p>{{ selectedProducer.annualVolume?.toLocaleString() }} т</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">Типы упаковки</label><div class="flex flex-wrap gap-1 mt-1"><span v-for="pt in selectedProducer.packagingTypes" :key="pt" class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">{{ pt }}</span></div></div>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end"><button @click="showViewModal = false" class="px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700">{{ $t('common.close') }}</button></div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">{{ isCreating ? 'Создание записи' : 'Редактирование' }}</h3>
            <button @click="showEditModal = false" class="p-2 text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
            <!-- Landfill form -->
            <template v-if="activeRegistry === 'landfills'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Название *</label><input v-model="landfillForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Регион</label><select v-model="landfillForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">Выберите</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Район</label><input v-model="landfillForm.district" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Тип</label><select v-model="landfillForm.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option>Санкционированный</option><option>Несанкционированный</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Статус</label><select v-model="landfillForm.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option>Активен</option><option>Закрыт</option><option>На реконструкции</option><option>Рекультивирован</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Площадь (га)</label><input v-model.number="landfillForm.area" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Объём (т)</label><input v-model.number="landfillForm.volume" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Адрес</label><input v-model="landfillForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">GPS Широта</label><input v-model="landfillForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="42.8746" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">GPS Долгота</label><input v-model="landfillForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="74.5698" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Организация</label><input v-model="landfillForm.organization" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Виды отходов</label><div class="flex flex-wrap gap-2"><button v-for="wt in wasteTypeOptions" :key="wt" @click="toggleWasteType(landfillForm, wt)" :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', landfillForm.wasteTypes.includes(wt) ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']">{{ wt }}</button></div></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Примечания</label><textarea v-model="landfillForm.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"></textarea></div>
              </div>
            </template>
            <!-- Reception form -->
            <template v-if="activeRegistry === 'reception'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Название *</label><input v-model="receptionForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Регион</label><select v-model="receptionForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">Выберите</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Район</label><input v-model="receptionForm.district" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Адрес</label><input v-model="receptionForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">GPS Широта</label><input v-model="receptionForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">GPS Долгота</label><input v-model="receptionForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Режим работы</label><input v-model="receptionForm.workingHours" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="09:00-18:00" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Статус</label><select v-model="receptionForm.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option>Работает</option><option>Временно закрыт</option><option>Закрыт</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label><input v-model="receptionForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input v-model="receptionForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Организация</label><input v-model="receptionForm.organization" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Виды отходов</label><div class="flex flex-wrap gap-2"><button v-for="wt in wasteTypeOptions" :key="wt" @click="toggleWasteType(receptionForm, wt)" :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', receptionForm.wasteTypes.includes(wt) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']">{{ wt }}</button></div></div>
              </div>
            </template>
            <!-- Recycler form -->
            <template v-if="activeRegistry === 'recyclers'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Наименование *</label><input v-model="recyclerForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">ИНН</label><input v-model="recyclerForm.inn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Регион</label><select v-model="recyclerForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">Выберите</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Адрес</label><input v-model="recyclerForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">GPS Широта</label><input v-model="recyclerForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">GPS Долгота</label><input v-model="recyclerForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Директор</label><input v-model="recyclerForm.director" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Контактное лицо</label><input v-model="recyclerForm.contactPerson" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label><input v-model="recyclerForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input v-model="recyclerForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Вид деятельности</label><input v-model="recyclerForm.activityType" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Мощность (т/год)</label><input v-model.number="recyclerForm.capacity" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Лицензия</label><input v-model="recyclerForm.licenseNumber" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Статус</label><select v-model="recyclerForm.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option>Активен</option><option>На проверке</option><option>Приостановлен</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Виды отходов</label><div class="flex flex-wrap gap-2"><button v-for="wt in wasteTypeOptions" :key="wt" @click="toggleWasteType(recyclerForm, wt)" :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', recyclerForm.wasteTypes.includes(wt) ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']">{{ wt }}</button></div></div>
              </div>
            </template>
            <!-- Producer form -->
            <template v-if="activeRegistry === 'producers'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Наименование *</label><input v-model="producerForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">ИНН</label><input v-model="producerForm.inn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Регион</label><select v-model="producerForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">Выберите</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Адрес</label><input v-model="producerForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">GPS Широта</label><input v-model="producerForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">GPS Долгота</label><input v-model="producerForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Директор</label><input v-model="producerForm.director" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Контактное лицо</label><input v-model="producerForm.contactPerson" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label><input v-model="producerForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input v-model="producerForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Вид продукции</label><input v-model="producerForm.productType" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Годовой объём (т)</label><input v-model.number="producerForm.annualVolume" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Статус</label><select v-model="producerForm.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option>Активен</option><option>На проверке</option><option>Приостановлен</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">Типы упаковки</label><div class="flex flex-wrap gap-2"><button v-for="pt in ['ПЭТ-бутылки', 'Стеклянные бутылки', 'Алюминиевые банки', 'Тетрапак', 'Пластиковые контейнеры', 'Пластиковые стаканы', 'Картонная упаковка']" :key="pt" @click="toggleWasteType(producerForm, pt)" :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', producerForm.packagingTypes.includes(pt) ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']">{{ pt }}</button></div></div>
              </div>
            </template>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button @click="showEditModal = false" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">{{ $t('common.cancel') }}</button>
            <button @click="saveItem" class="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium">{{ isCreating ? $t('common.add') : $t('common.save') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Удалить запись?</h3>
            <p class="text-gray-600 mb-6">Вы уверены, что хотите удалить "{{ getSelectedItemName() }}"? Это действие нельзя отменить.</p>
            <div class="flex gap-3 justify-center">
              <button @click="showDeleteConfirm = false" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">{{ $t('common.cancel') }}</button>
              <button @click="deleteItem" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">{{ $t('common.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Success Notification -->
    <Teleport to="body">
      <div v-if="showNotification" class="fixed top-4 right-4 z-[100] bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        <span class="font-medium">{{ notificationMessage }}</span>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<style>
.custom-marker { background: transparent !important; border: none !important; }
.leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; }
.leaflet-popup-content { margin: 12px 14px; }
.leaflet-popup-close-button { top: 8px !important; right: 8px !important; }
</style>
