<script setup lang="ts">
import { ref, computed } from 'vue'

// Search query
const searchQuery = ref('')

// Abbreviations data sorted alphabetically
const abbreviations = [
  { abbr: 'АИС', full: 'Автоматизированная информационная система' },
  { abbr: 'АО', full: 'Аппаратное обеспечение' },
  { abbr: 'АРМ', full: 'Автоматизированное рабочее место' },
  { abbr: 'БД', full: 'База данных' },
  { abbr: 'BI', full: 'Business Intelligence — бизнес-аналитика' },
  { abbr: 'ВОЛС', full: 'Волоконно-оптическая линия связи' },
  { abbr: 'ГИС', full: 'Геоинформационная система' },
  { abbr: 'ГНС', full: 'Государственная налоговая служба' },
  { abbr: 'ГОСТ', full: 'Государственный стандарт' },
  { abbr: 'ДГУ', full: 'Дизель-генераторная установка' },
  { abbr: 'ЕИС', full: 'Единая информационная система' },
  { abbr: 'ЕСИ', full: 'Единая система идентификации' },
  { abbr: 'ИБ', full: 'Информационная безопасность' },
  { abbr: 'ИБП', full: 'Источник бесперебойного питания' },
  { abbr: 'ИС', full: 'Информационная система' },
  { abbr: 'ИТ', full: 'Информационные технологии' },
  { abbr: 'КПД', full: 'Коэффициент полезного действия' },
  { abbr: 'КР', full: 'Кыргызская Республика' },
  { abbr: 'ЛВС', full: 'Локально-вычислительная сеть' },
  { abbr: 'ЛК', full: 'Личный кабинет' },
  { abbr: 'ГП ЭО', full: 'Государственное предприятие «Эко Оператор»' },
  { abbr: 'МСУ', full: 'Местное самоуправление' },
  { abbr: 'МФ', full: 'Министерство финансов' },
  { abbr: 'МЮ', full: 'Министерство юстиции' },
  { abbr: 'НПА', full: 'Нормативно-правовой акт' },
  { abbr: 'НСД', full: 'Несанкционированный доступ' },
  { abbr: 'НСИ', full: 'Нормативно-справочная информация' },
  { abbr: 'ОС', full: 'Операционная система' },
  { abbr: 'ОЭП', full: 'Облачная электронная подпись' },
  { abbr: 'ПК', full: 'Персональный компьютер' },
  { abbr: 'ПКБ', full: 'Постановление Кабинета Министров' },
  { abbr: 'ПКМ', full: 'Постановление Кабинета Министров' },
  { abbr: 'ПО', full: 'Программное обеспечение' },
  { abbr: 'RAID', full: 'Redundant Array of Independent Disks — избыточный массив независимых дисков' },
  { abbr: 'РОП', full: 'Расширенная ответственность производителя' },
  { abbr: 'СМЭВ', full: 'Система межведомственного электронного взаимодействия' },
  { abbr: 'СРК', full: 'Система резервного копирования' },
  { abbr: 'СУБД', full: 'Система управления базами данных' },
  { abbr: 'ТБО', full: 'Твёрдые бытовые отходы' },
  { abbr: 'ЭЦП', full: 'Электронная цифровая подпись' },
].sort((a, b) => a.abbr.localeCompare(b.abbr, 'ru'))

// Filtered abbreviations based on search
const filteredAbbreviations = computed(() => {
  if (!searchQuery.value) return abbreviations
  const query = searchQuery.value.toLowerCase()
  return abbreviations.filter(
    item =>
      item.abbr.toLowerCase().includes(query) ||
      item.full.toLowerCase().includes(query)
  )
})

// Group by first letter for better navigation
const groupedAbbreviations = computed(() => {
  const groups: Record<string, typeof abbreviations> = {}
  filteredAbbreviations.value.forEach(item => {
    const firstLetter = item.abbr[0].toUpperCase()
    if (!groups[firstLetter]) {
      groups[firstLetter] = []
    }
    groups[firstLetter].push(item)
  })
  return groups
})
</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <div class="container-main">
      <!-- Page header -->
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#415861] uppercase mb-4">
          Глоссарий
        </h1>
        <p class="text-lg md:text-xl text-[#415861] max-w-2xl mx-auto">
          Сокращения и условные обозначения, используемые в системе АИС «ГП Эко Оператор»
        </p>
      </div>

      <!-- Search -->
      <div class="max-w-xl mx-auto mb-8">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по сокращению или названию..."
            class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d] text-gray-700 placeholder-gray-400"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p v-if="searchQuery && filteredAbbreviations.length === 0" class="text-center text-gray-500 mt-4">
          По запросу "{{ searchQuery }}" ничего не найдено
        </p>
        <p v-else-if="searchQuery" class="text-center text-gray-500 mt-2 text-sm">
          Найдено: {{ filteredAbbreviations.length }} из {{ abbreviations.length }}
        </p>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-4xl mx-auto">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-[#0e888d] text-white">
                <th class="px-6 py-4 text-left text-sm font-semibold w-1/4">Сокращение</th>
                <th class="px-6 py-4 text-left text-sm font-semibold">Полное наименование</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in filteredAbbreviations"
                :key="item.abbr"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                class="hover:bg-[#0e888d]/5 transition-colors"
              >
                <td class="px-6 py-3">
                  <span class="font-bold text-[#0e888d] text-base">{{ item.abbr }}</span>
                </td>
                <td class="px-6 py-3 text-gray-700">{{ item.full }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="filteredAbbreviations.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-1">Ничего не найдено</h3>
          <p class="text-gray-500">Попробуйте изменить поисковый запрос</p>
        </div>
      </div>

      <!-- Info Note -->
      <div class="max-w-4xl mx-auto mt-8">
        <div class="bg-[#0e888d]/5 border border-[#0e888d]/20 rounded-xl p-5 flex items-start gap-4">
          <div class="w-10 h-10 bg-[#0e888d] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-1">О глоссарии</h4>
            <p class="text-sm text-gray-600">
              Данный глоссарий содержит сокращения и условные обозначения, применяемые в нормативных документах
              и в автоматизированной информационной системе «ГП Эко Оператор».
            </p>
          </div>
        </div>
      </div>

      <!-- Back link -->
      <div class="text-center mt-8">
        <router-link
          to="/about"
          class="inline-flex items-center gap-2 text-[#0e888d] hover:text-[#0b6d71] font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Вернуться на страницу «О портале»
        </router-link>
      </div>
    </div>
  </div>
</template>
