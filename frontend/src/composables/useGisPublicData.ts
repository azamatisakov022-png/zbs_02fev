// ═══════════════════════════════════════════════════════════════════════════
// useGisPublicData — единый источник данных для ГИС-карты.
//
// Грузит 4 типа объектов с публичных backend-endpoints (без JWT).
// Используется и публичной картой `/registries`, и ЛК сотрудника `/employee/map`,
// чтобы гарантировать что обе страницы показывают ОДИНАКОВЫЕ данные.
//
// Кэш живёт в module-scope: откроешь сначала /registries, потом /employee/map
// — второй экран получит данные мгновенно из памяти.
// ═══════════════════════════════════════════════════════════════════════════
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import api from '../api/client'

// ─── DTOs ровно в том виде, как возвращает backend (из Java Map<String, Object>) ───

export interface PublicLandfill {
  id: number
  name: string
  type?: string            // MUNICIPAL | INDUSTRIAL | HAZARDOUS | MIXED
  region?: string
  address?: string
  latitude?: number
  longitude?: number
  area?: number
  designCapacity?: number
  currentVolume?: number
  fillPercent?: number
  yearOpened?: number
  status?: string          // ACTIVE | CLOSED | SUSPENDED
  operator?: string
}

export interface PublicRecycler {
  id: number
  companyName: string
  inn?: string
  region?: string
  address?: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  licenseNumber?: string
  licenseExpiry?: string
  wasteTypes?: string[]
  status?: string          // ACTIVE | SUSPENDED | INACTIVE
}

export interface PublicCollectionPoint {
  id: number
  name: string
  region?: string
  address?: string
  latitude?: number
  longitude?: number
  wasteTypes?: string[]
  operatingHours?: string
  operator?: string
  contactPhone?: string
  status?: string          // ACTIVE | CLOSED | RENOVATING
}

export interface PublicDump {
  id: number
  name: string
  region?: string
  address?: string
  latitude?: number
  longitude?: number
  wasteTypes?: string[]
  status?: string          // ACTIVE | UNDER_CLEANUP | CLEANED | MONITORING
  notes?: string
  area?: number
  discoveredDate?: string
  estimatedVolume?: number
}

// ─── Module-scope кэш ───
const landfills = ref<PublicLandfill[]>([])
const recyclers = ref<PublicRecycler[]>([])
const collectionPoints = ref<PublicCollectionPoint[]>([])
const dumps = ref<PublicDump[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const loadedOnce = ref(false)

/** Загрузка (force=true — принудительное обновление, иначе skip если уже загружено). */
export async function loadGisPublicData(force = false): Promise<void> {
  if (loadedOnce.value && !force) return
  loading.value = true
  error.value = null
  try {
    const [lf, rc, cp, dm] = await Promise.all([
      api.get<PublicLandfill[]>('/public/landfills'),
      api.get<PublicRecycler[]>('/public/recyclers'),
      api.get<PublicCollectionPoint[]>('/public/collection-points'),
      api.get<PublicDump[]>('/dumps/public'),
    ])
    landfills.value = Array.isArray(lf.data) ? lf.data : []
    recyclers.value = Array.isArray(rc.data) ? rc.data : []
    collectionPoints.value = Array.isArray(cp.data) ? cp.data : []
    dumps.value = Array.isArray(dm.data) ? dm.data : []
    loadedOnce.value = true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Ошибка загрузки'
    error.value = msg
    console.warn('[useGisPublicData] backend fetch failed:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Хук: вернёт reactive-массивы и триггернёт загрузку на onMounted.
 *
 * @param options.pollIntervalMs — если задано, компонент будет автоматически
 *   обновлять данные с указанной периодичностью (мс). Используется на
 *   публичной карте `/registries`, чтобы инспектор в одном городе видел
 *   изменения, внесённые сотрудником в другом, без перезагрузки страницы.
 *
 *   Рекомендованное значение для гос-системы: 60000 (раз в минуту) —
 *   баланс между «свежестью» и нагрузкой на backend.
 */
export function useGisPublicData(options?: { pollIntervalMs?: number }) {
  let pollTimer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    if (!loadedOnce.value && !loading.value) loadGisPublicData()
    if (options?.pollIntervalMs && options.pollIntervalMs > 0) {
      pollTimer = setInterval(() => {
        // Тихий refresh — не показываем спиннер, не валим UI на ошибке
        loadGisPublicData(true).catch(() => {})
      }, options.pollIntervalMs)
    }
  })

  onUnmounted(() => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  })

  return {
    landfills,
    recyclers,
    collectionPoints,
    dumps,
    loading,
    error,
    loadedOnce,
    refresh: () => loadGisPublicData(true),
  } as {
    landfills: Ref<PublicLandfill[]>
    recyclers: Ref<PublicRecycler[]>
    collectionPoints: Ref<PublicCollectionPoint[]>
    dumps: Ref<PublicDump[]>
    loading: Ref<boolean>
    error: Ref<string | null>
    loadedOnce: Ref<boolean>
    refresh: () => Promise<void>
  }
}
