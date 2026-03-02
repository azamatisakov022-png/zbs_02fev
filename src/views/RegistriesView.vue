<script setup lang="ts">
import { ref } from 'vue'

type RegistryStatus = 'active' | 'review' | 'suspended'

const statusConfig: Record<RegistryStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Активен', bg: 'rgba(14,136,141,0.2)', text: '#0e888d' },
  review: { label: 'На проверке', bg: 'rgba(255,183,27,0.2)', text: '#fea629' },
  suspended: { label: 'Приостановлен', bg: 'rgba(255,86,82,0.2)', text: '#ff5652' },
}

const tabs = [
  { id: 'payers', label: 'Плательщики', count: 1247 },
  { id: 'processors', label: 'Переработчики', count: 89 },
  { id: 'polygons', label: 'Полигоны', count: 47 },
]

const regions = [
  { name: 'Талас', count: 4, top: '11%', left: 'calc(50% - 198px)' },
  { name: 'Чуй', count: 2, top: '4.5%', left: '50%' },
  { name: 'Иссык-Куль', count: 1, top: '20%', left: 'calc(50% + 201px)' },
  { name: 'Джалал-Абад', count: 7, top: '37.5%', left: 'calc(50% - 140px)' },
  { name: 'Нарын', count: 7, top: '38%', left: 'calc(50% + 56px)' },
  { name: 'Ош', count: 12, top: '67%', left: 'calc(50% - 44px)' },
  { name: 'Баткен', count: 19, top: '63%', left: 'calc(50% - 304px)' },
]

const registries = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: 'ОсОО «ЭкоИмпорт»',
  region: 'г. Бишкек',
  activity: 'Импорт пластиковой упаковки',
  status: (i === 3 ? 'review' : i === 7 ? 'suspended' : 'active') as RegistryStatus,
}))

const activeTab = ref('payers')
</script>

<template>
 <div class="mb-[50px]">
   <div class="container-main pb-16">
    <!-- Title Section -->
    <div class="pt-[40px] pb-[40px]">
      <div class="flex flex-col max-w-[601px]">
        <h1 class="section-title">
          Реестры
        </h1>
        <p class="section-subtitle">
          Публичные реестры участников системы (только чтение)
        </p>
      </div>
    </div>

    <!-- Search/Filter Bar -->
    <div class="pb-[27px]">
      <div class="flex items-center justify-between">
        <span class="text-[22px] font-semibold text-text-main">
          ГИС-карта организаций
        </span>
        <div class="flex items-center gap-[40px]">
          <div class="flex items-center gap-[12px]">
            <input
              type="text"
              placeholder="Поиск по названию"
              class="w-[224px] h-[40px] border border-[#ebebeb] rounded-2xl pt-[10px] pb-[10px] text-[14px] text-text-main placeholder:text-text-main outline-none text-center"
            />
            <button class="bg-bg-light rounded-2xl px-[30px] py-[12px] flex items-center gap-[8px] text-[14px] font-medium text-text-main">
              Все типы
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#415861" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="bg-bg-light rounded-2xl px-[30px] py-[12px] flex items-center gap-[8px] text-[14px] font-medium text-text-main">
              Все области
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#415861" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <button class="bg-primary rounded-2xl px-[30px] py-[12px] text-[14px] font-medium text-white hover:opacity-90 transition-opacity">
            Найти
          </button>
        </div>
      </div>
    </div>

    <!-- Map Section -->
    <div class="pb-[30px]">
      <div class="relative w-full h-[480px] bg-[#ccefe9] rounded-[50px] overflow-hidden">
        <!-- Map SVG -->
        <div class="absolute top-[41px] left-1/2 -translate-x-1/2 w-[792px] h-[389px]">
          <img src="@/assets/images/icons/kyrgyzstan-map.svg" alt="Карта Кыргызстана" class="w-full h-full object-contain" />
        </div>

        <!-- Region Labels -->
        <div
          v-for="region in regions"
          :key="region.name"
          class="absolute -translate-x-1/2 bg-white rounded-[30px] px-[20px] py-[10px] flex flex-col items-center"
          :style="{ top: region.top, left: region.left }"
        >
          <span class="text-[30px] font-bold text-primary leading-normal">
            {{ region.count }}
          </span>
          <span class="text-[20px] font-medium text-text-main leading-normal">
            {{ region.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="pb-[37px]">
      <div class="flex gap-[20px]">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-[30px] py-[12px] rounded-2xl text-[16px] font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'bg-bg-light text-text-main hover:bg-[#e8f0f2]'
          ]"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>
    </div>


    <div>
      <div class="w-full border border-bg-light">
        <!-- Table Header -->
        <div class="flex bg-bg-light">
          <div class="w-[78px] shrink-0 px-[20px] py-[16px] flex items-center justify-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">№</span>
          </div>
          <div class="w-[465px] shrink-0 px-[20px] py-[16px] flex items-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">Наименование</span>
          </div>
          <div class="w-[190px] shrink-0 px-[20px] py-[16px] flex items-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">Регион</span>
          </div>
          <div class="flex-1 px-[10px] py-[16px] flex items-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">Вид деятельности</span>
          </div>
          <div class="w-[150px] shrink-0 px-[20px] py-[16px] flex items-center justify-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">Статус</span>
          </div>
          <div class="w-[150px] shrink-0 px-[10px] py-[16px] flex items-center justify-center">
            <span class="text-[18px] font-medium text-black">Действия</span>
          </div>
        </div>

        <!-- Table Rows -->
        <div
          v-for="item in registries"
          :key="item.id"
          class="flex border-t border-bg-light bg-white"
        >
          <div class="w-[78px] shrink-0 px-[20px] py-[16px] flex items-center justify-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">{{ item.id }}</span>
          </div>
          <div class="w-[465px] shrink-0 px-[20px] py-[16px] flex items-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">{{ item.name }}</span>
          </div>
          <div class="w-[190px] shrink-0 px-[20px] py-[16px] flex items-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">{{ item.region }}</span>
          </div>
          <div class="flex-1 px-[20px] py-[16px] flex items-center border-r border-bg-light">
            <span class="text-[18px] font-medium text-black">{{ item.activity }}</span>
          </div>
          <div class="w-[150px] shrink-0 px-[20px] py-[16px] flex items-center justify-center border-r border-bg-light">
            <span
              class="text-[12px] font-medium px-[10px] py-[8px] rounded-xl"
              :style="{ backgroundColor: statusConfig[item.status].bg, color: statusConfig[item.status].text }"
            >
              {{ statusConfig[item.status].label }}
            </span>
          </div>
          <div class="w-[150px] shrink-0 px-[10px] py-[16px] flex items-center justify-center">
            <button class="bg-primary text-white text-[12px] font-medium px-[10px] py-[8px] rounded-xl hover:opacity-90 transition-opacity">
              Просмотр
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
 </div>
</template>
