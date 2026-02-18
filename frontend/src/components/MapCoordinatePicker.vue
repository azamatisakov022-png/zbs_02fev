<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

interface Coords {
  lat: number
  lng: number
}

const props = defineProps<{
  modelValue: Coords | null
  visible: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Coords]
  'update:visible': [value: boolean]
}>()

const mapCenter = ref<[number, number]>([41.2, 74.7])
const mapZoom = ref(7)
const pickerCoords = ref<Coords | null>(null)
const searchQuery = ref('')
const searchResults = ref<Array<{ display_name: string; lat: string; lon: string }>>([])
const showResults = ref(false)
const searchTimeout = ref<any>(null)

const markerIcon = L.divIcon({
  className: 'picker-marker',
  html: '<div style="background-color:#2563eb;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.modelValue && props.modelValue.lat && props.modelValue.lng) {
      pickerCoords.value = { ...props.modelValue }
      mapCenter.value = [props.modelValue.lat, props.modelValue.lng]
      mapZoom.value = 13
    } else {
      pickerCoords.value = null
      mapCenter.value = [41.2, 74.7]
      mapZoom.value = 7
    }
    searchQuery.value = ''
    searchResults.value = []
  }
})

const onMapClick = (e: any) => {
  const latlng = e.latlng
  pickerCoords.value = { lat: parseFloat(latlng.lat.toFixed(6)), lng: parseFloat(latlng.lng.toFixed(6)) }
}

const searchAddress = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showResults.value = false
    return
  }
  searchTimeout.value = setTimeout(async () => {
    try {
      const q = encodeURIComponent(searchQuery.value)
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=kg`)
      searchResults.value = await resp.json()
      showResults.value = searchResults.value.length > 0
    } catch {
      searchResults.value = []
      showResults.value = false
    }
  }, 400)
}

const selectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
  const lat = parseFloat(parseFloat(result.lat).toFixed(6))
  const lng = parseFloat(parseFloat(result.lon).toFixed(6))
  pickerCoords.value = { lat, lng }
  mapCenter.value = [lat, lng]
  mapZoom.value = 15
  searchQuery.value = result.display_name
  showResults.value = false
}

const confirm = () => {
  if (pickerCoords.value) {
    emit('update:modelValue', { ...pickerCoords.value })
  }
  emit('update:visible', false)
}

const cancel = () => {
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="cancel"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden" style="border-radius: 12px;">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Указать координаты на карте</h3>
          <button @click="cancel" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Address search -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              @input="searchAddress"
              @focus="showResults = searchResults.length > 0"
              type="text"
              placeholder="Поиск адреса..."
              class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
            <div
              v-if="showResults"
              class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50"
            >
              <div
                v-for="(result, idx) in searchResults"
                :key="idx"
                @mousedown.prevent="selectSearchResult(result)"
                class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm text-gray-700"
              >
                {{ result.display_name }}
              </div>
            </div>
          </div>

          <!-- Map -->
          <div class="rounded-lg overflow-hidden border border-gray-200" style="height: 400px;">
            <LMap
              :zoom="mapZoom"
              :center="mapCenter"
              :use-global-leaflet="false"
              class="h-full w-full"
              @click="onMapClick"
            >
              <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LMarker
                v-if="pickerCoords"
                :lat-lng="[pickerCoords.lat, pickerCoords.lng]"
                :icon="markerIcon"
                :draggable="true"
                @moveend="(e: any) => { const ll = e.target.getLatLng(); pickerCoords = { lat: parseFloat(ll.lat.toFixed(6)), lng: parseFloat(ll.lng.toFixed(6)) } }"
              />
            </LMap>
          </div>

          <!-- Coordinates display -->
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">
              <template v-if="pickerCoords">
                Координаты: <span class="font-mono font-medium text-gray-700">{{ pickerCoords.lat }}, {{ pickerCoords.lng }}</span>
              </template>
              <template v-else>
                Нажмите на карту для выбора координат
              </template>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            @click="cancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            @click="confirm"
            :disabled="!pickerCoords"
            :class="[
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
              pickerCoords ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
            ]"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.picker-marker {
  background: transparent !important;
  border: none !important;
}
</style>
