<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CustomSelect from '../components/ui/CustomSelect.vue'
import ropData from '../data/rop-data.json'

// Types
interface GoodsSubgroup {
  name: string
  gskpCode: string
  tnVedCode: string
  tnVedName: string
  category: string
}

interface PackagingSubgroup {
  name: string
  material: string
  letterCode: string
  digitalCode: string
  category: string
}

interface GoodsGroup {
  number: number
  name: string
  shortName: string
  ropRate: number
  subgroups: GoodsSubgroup[]
}

interface PackagingGroup {
  number: number
  name: string
  shortName: string
  ropRate: number
  subgroups: PackagingSubgroup[]
}

interface GoodsResult {
  group: string
  subgroup: string
  gskpCode: string
  tnVedCode: string
  tnVedName: string
  mass: number
  rate: number
  normative: number
  total: number
}

interface PackagingResult {
  group: string
  packagingName: string
  material: string
  letterCode: string
  digitalCode: string
  mass: number
  rate: number
  normative: number
  total: number
}

interface SelectOption {
  value: string | number | null
  label: string
  shortLabel?: string
  labelPrefix?: string
  sublabel?: string
  group?: string
}

// Active tab
type TabType = 'goods' | 'waste'
const activeTab = ref<TabType>('goods')

// Data
const goodsGroups = ropData.goods as GoodsGroup[]
const packagingGroups = ropData.packaging as PackagingGroup[]
const normatives = ropData.normatives as Record<string, Record<string, number>>

// Build group options for CustomSelect
const groupOptions = computed((): SelectOption[] => {
  const options: SelectOption[] = [
    { value: null, label: '— Выберите группу —' }
  ]

  // Add goods groups
  goodsGroups.forEach(g => {
    const prefix = `Группа №${g.number}:`
    options.push({
      value: g.number,
      label: g.name,
      shortLabel: `${prefix} ${g.shortName}`,
      labelPrefix: prefix,
      sublabel: `Ставка: ${formatNumber(g.ropRate, 0)} сом/тонн`,
      group: 'ТОВАРЫ (Группы 1-18)'
    })
  })

  // Add packaging groups
  packagingGroups.forEach(g => {
    const prefix = `Группа №${g.number}:`
    options.push({
      value: g.number,
      label: g.name,
      shortLabel: `${prefix} ${g.shortName}`,
      labelPrefix: prefix,
      sublabel: `Ставка: ${formatNumber(g.ropRate, 0)} сом/тонн`,
      group: 'УПАКОВКА (Группы 19-24)'
    })
  })

  return options
})

// Form state
const selectedGroupNumber = ref<number | null>(null)
const selectedSubgroupIndex = ref<number | null>(null)
const mass = ref<string>('')
const year = ref<string>('2026')
const operationType = ref<string>('import')
const selfProcessing = ref<boolean>(false)
const processedAmount = ref<string>('')

// Waste form state
const wasteSelectedGroupNumber = ref<number | null>(null)
const wasteSelectedSubgroupIndex = ref<number | null>(null)
const establishedQty = ref<string>('')
const actuallyProcessed = ref<string>('')
const wasteYear = ref<string>('2027')

// Results
const showResults = ref(false)
const goodsResult = ref<GoodsResult | null>(null)
const packagingResult = ref<PackagingResult | null>(null)

// Computed values
const selectedGroup = computed(() => {
  if (selectedGroupNumber.value === null) return null
  return [...goodsGroups, ...packagingGroups].find(g => g.number === selectedGroupNumber.value) || null
})

const isPackaging = computed(() => {
  return selectedGroup.value && selectedGroup.value.number >= 19
})

// Build subgroup options for CustomSelect
const subgroupOptions = computed((): SelectOption[] => {
  const options: SelectOption[] = [
    { value: null, label: selectedGroup.value ? '— Выберите подгруппу —' : '— Сначала выберите группу —' }
  ]

  if (!selectedGroup.value) return options

  selectedGroup.value.subgroups.forEach((sub, index) => {
    if (isPackaging.value) {
      const packSub = sub as PackagingSubgroup
      options.push({
        value: index,
        label: packSub.name,
        shortLabel: packSub.name,
        sublabel: packSub.material ? `Материал: ${packSub.material} | Код: ${packSub.letterCode || '-'} / ${packSub.digitalCode || '-'}` : undefined
      })
    } else {
      const goodsSub = sub as GoodsSubgroup
      // Create short label from name
      let shortLabel = goodsSub.name

      // Find key differentiating phrases and highlight them
      const keyPhrases = [
        'не более 121', 'более 121',
        'не менее 40 см', 'менее 40 см',
        'не более 2 л', 'более 2 л',
        'самоклеящиеся', 'кроме самоклеящихся',
        'напечатанные', 'кроме напечатанных',
        'армированные', 'неармированные',
        'для легковых', 'для грузовых', 'для автобусов', 'для мотоциклов', 'для велосипедов',
        'для использования в авиации', 'прочего назначения'
      ]

      keyPhrases.forEach(phrase => {
        const regex = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        if (shortLabel.match(regex)) {
          shortLabel = shortLabel.replace(regex, '【$1】')
        }
      })

      // Build sublabel with codes
      const codes: string[] = []
      if (goodsSub.gskpCode) codes.push(`ГСКП: ${goodsSub.gskpCode}`)
      if (goodsSub.tnVedCode && goodsSub.tnVedCode !== '-') codes.push(`ТН ВЭД: ${goodsSub.tnVedCode}`)

      options.push({
        value: index,
        label: goodsSub.name,
        shortLabel: shortLabel,
        sublabel: codes.length > 0 ? codes.join(' | ') : undefined
      })
    }
  })

  return options
})

const selectedSubgroup = computed(() => {
  if (selectedSubgroupIndex.value === null || !selectedGroup.value) return null
  return selectedGroup.value.subgroups[selectedSubgroupIndex.value]
})

const tnVedNameDisplay = computed(() => {
  if (!selectedSubgroup.value) return ''
  if (isPackaging.value) {
    const sub = selectedSubgroup.value as PackagingSubgroup
    return sub.material ? `${sub.material} (${sub.letterCode || '-'})` : ''
  } else {
    const sub = selectedSubgroup.value as GoodsSubgroup
    return sub.tnVedName || '-'
  }
})

const currentRate = computed(() => {
  return selectedGroup.value?.ropRate || 0
})

const currentNormative = computed(() => {
  if (!selectedGroup.value) return 0
  const groupNorm = normatives[selectedGroup.value.number.toString()]
  if (!groupNorm) return 0
  return groupNorm[year.value] || 0
})

// Waste computed values
const wasteSelectedGroup = computed(() => {
  if (wasteSelectedGroupNumber.value === null) return null
  return [...goodsGroups, ...packagingGroups].find(g => g.number === wasteSelectedGroupNumber.value) || null
})

const wasteIsPackaging = computed(() => {
  return wasteSelectedGroup.value && wasteSelectedGroup.value.number >= 19
})

const wasteSubgroupOptions = computed((): SelectOption[] => {
  const options: SelectOption[] = [
    { value: null, label: wasteSelectedGroup.value ? '— Выберите подгруппу —' : '— Сначала выберите группу —' }
  ]

  if (!wasteSelectedGroup.value) return options

  wasteSelectedGroup.value.subgroups.forEach((sub, index) => {
    if (wasteIsPackaging.value) {
      const packSub = sub as PackagingSubgroup
      options.push({
        value: index,
        label: packSub.name,
        shortLabel: packSub.name,
        sublabel: packSub.material ? `Материал: ${packSub.material} | Код: ${packSub.letterCode || '-'} / ${packSub.digitalCode || '-'}` : undefined
      })
    } else {
      const goodsSub = sub as GoodsSubgroup
      let shortLabel = goodsSub.name

      const keyPhrases = [
        'не более 121', 'более 121',
        'не менее 40 см', 'менее 40 см',
        'не более 2 л', 'более 2 л',
        'самоклеящиеся', 'кроме самоклеящихся',
        'напечатанные', 'кроме напечатанных',
        'армированные', 'неармированные',
        'для легковых', 'для грузовых', 'для автобусов', 'для мотоциклов', 'для велосипедов',
        'для использования в авиации', 'прочего назначения'
      ]

      keyPhrases.forEach(phrase => {
        const regex = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        if (shortLabel.match(regex)) {
          shortLabel = shortLabel.replace(regex, '【$1】')
        }
      })

      const codes: string[] = []
      if (goodsSub.gskpCode) codes.push(`ГСКП: ${goodsSub.gskpCode}`)
      if (goodsSub.tnVedCode && goodsSub.tnVedCode !== '-') codes.push(`ТН ВЭД: ${goodsSub.tnVedCode}`)

      options.push({
        value: index,
        label: goodsSub.name,
        shortLabel: shortLabel,
        sublabel: codes.length > 0 ? codes.join(' | ') : undefined
      })
    }
  })

  return options
})

const wasteSelectedSubgroup = computed(() => {
  if (wasteSelectedSubgroupIndex.value === null || !wasteSelectedGroup.value) return null
  return wasteSelectedGroup.value.subgroups[wasteSelectedSubgroupIndex.value]
})

const wasteTnVedNameDisplay = computed(() => {
  if (!wasteSelectedSubgroup.value) return ''
  if (wasteIsPackaging.value) {
    const sub = wasteSelectedSubgroup.value as PackagingSubgroup
    return sub.material ? `${sub.material} (${sub.letterCode || '-'})` : ''
  } else {
    const sub = wasteSelectedSubgroup.value as GoodsSubgroup
    return sub.tnVedName || '-'
  }
})

const wasteCurrentRate = computed(() => {
  return wasteSelectedGroup.value?.ropRate || 0
})

const wasteCurrentNormative = computed(() => {
  if (!wasteSelectedGroup.value) return 0
  const groupNorm = normatives[wasteSelectedGroup.value.number.toString()]
  if (!groupNorm) return 0
  return groupNorm[wasteYear.value] || 0
})

// Info text
const infoText = computed(() => {
  if (activeTab.value === 'goods') {
    return {
      text: 'Утилизационный сбор уплачивается производителями и импортёрами товаров согласно ст. 29 Закона КР «Об отходах производства и потребления».',
      formula: 'Формула: Усб = Сус × Мтв/уп × Нпер',
      bgClass: 'bg-[rgba(0,175,145,0.15)]'
    }
  } else {
    return {
      text: 'Режим расчёта для организаций, обеспечивающих самостоятельную переработку отходов.',
      formula: 'Формула: Усб = Сус × (Куст - Кфакт)',
      bgClass: 'bg-[rgba(255,183,27,0.15)]'
    }
  }
})

// Years
const years = ['2025', '2026', '2027', '2028', '2029', '2030']

// Operation types
const operationTypes = [
  { value: 'import', label: 'Импорт из третьих стран/ввоз из ЕАЭС' },
  { value: 'production', label: 'Производство на территории КР' }
]

// Watch for group change to reset subgroup
watch(selectedGroupNumber, () => {
  selectedSubgroupIndex.value = null
  showResults.value = false
})

watch(wasteSelectedGroupNumber, () => {
  wasteSelectedSubgroupIndex.value = null
  showResults.value = false
})

// Format number
function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

// Calculate for goods/packaging
function handleCalculate() {
  if (!selectedGroup.value || selectedSubgroupIndex.value === null) {
    alert('Пожалуйста, выберите группу и подгруппу товара')
    return
  }

  const massValue = parseFloat(mass.value)
  if (!massValue || massValue <= 0) {
    alert('Пожалуйста, укажите массу товара')
    return
  }

  const rate = currentRate.value
  const normative = currentNormative.value

  let total: number
  if (selfProcessing.value) {
    const processed = parseFloat(processedAmount.value) || 0
    const required = massValue * normative
    const difference = Math.max(0, required - processed)
    total = rate * difference
  } else {
    total = rate * massValue * normative
  }

  if (isPackaging.value) {
    const sub = selectedSubgroup.value as PackagingSubgroup
    packagingResult.value = {
      group: selectedGroup.value.name,
      packagingName: sub.name,
      material: sub.material,
      letterCode: sub.letterCode,
      digitalCode: sub.digitalCode,
      mass: massValue,
      rate: rate,
      normative: normative,
      total: total
    }
    goodsResult.value = null
  } else {
    const sub = selectedSubgroup.value as GoodsSubgroup
    goodsResult.value = {
      group: selectedGroup.value.name,
      subgroup: sub.name,
      gskpCode: sub.gskpCode,
      tnVedCode: sub.tnVedCode,
      tnVedName: sub.tnVedName,
      mass: massValue,
      rate: rate,
      normative: normative,
      total: total
    }
    packagingResult.value = null
  }

  showResults.value = true
}

// Calculate for waste
function handleCalculateWaste() {
  if (!wasteSelectedGroup.value || wasteSelectedSubgroupIndex.value === null) {
    alert('Пожалуйста, выберите группу и подгруппу товара')
    return
  }

  const established = parseFloat(establishedQty.value)
  const actual = parseFloat(actuallyProcessed.value)

  if (!established || established <= 0) {
    alert('Пожалуйста, укажите установленное количество')
    return
  }

  if (actual === null || actual === undefined || actual < 0) {
    alert('Пожалуйста, укажите фактически переработанное количество')
    return
  }

  const rate = wasteCurrentRate.value
  const difference = Math.max(0, established - actual)
  const total = rate * difference

  if (wasteIsPackaging.value) {
    const sub = wasteSelectedSubgroup.value as PackagingSubgroup
    packagingResult.value = {
      group: wasteSelectedGroup.value.name,
      packagingName: sub.name,
      material: sub.material,
      letterCode: sub.letterCode,
      digitalCode: sub.digitalCode,
      mass: difference,
      rate: rate,
      normative: wasteCurrentNormative.value,
      total: total
    }
    goodsResult.value = null
  } else {
    const sub = wasteSelectedSubgroup.value as GoodsSubgroup
    goodsResult.value = {
      group: wasteSelectedGroup.value.name,
      subgroup: sub.name,
      gskpCode: sub.gskpCode,
      tnVedCode: sub.tnVedCode,
      tnVedName: sub.tnVedName,
      mass: difference,
      rate: rate,
      normative: wasteCurrentNormative.value,
      total: total
    }
    packagingResult.value = null
  }

  showResults.value = true
}
</script>

<template>
  <div class="calculator-page py-12 lg:py-16">
    <!-- Page header -->
    <div class="container-main mb-8">
      <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-[#415861] uppercase mb-3">
        Калькулятор РОП
      </h1>
      <p class="text-base md:text-lg lg:text-xl font-medium text-[#5a6d76]">
        Расчёт утилизационного сбора согласно ПКМ КР №730 от 03.12.2024 и ПКБ КР №322 от 19.06.2024
      </p>
    </div>

    <!-- Tab switcher -->
    <div class="container-main mb-8">
      <div class="bg-[#f1f5f9] rounded-2xl p-2 flex gap-2">
        <button
          @click="activeTab = 'goods'; showResults = false"
          :class="[
            'flex-1 py-5 lg:py-6 px-6 rounded-xl text-lg lg:text-xl font-semibold transition-all duration-200',
            activeTab === 'goods'
              ? 'bg-[#0e888d] text-white shadow-md'
              : 'text-[#5a6d76] hover:bg-white hover:shadow-sm'
          ]"
        >
          Товары и упаковка
        </button>
        <button
          @click="activeTab = 'waste'; showResults = false"
          :class="[
            'flex-1 py-5 lg:py-6 px-6 rounded-xl text-lg lg:text-xl font-semibold transition-all duration-200',
            activeTab === 'waste'
              ? 'bg-[#0e888d] text-white shadow-md'
              : 'text-[#5a6d76] hover:bg-white hover:shadow-sm'
          ]"
        >
          Самостоятельная переработка
        </button>
      </div>
    </div>

    <!-- Info banner -->
    <div class="container-main mb-10">
      <div :class="[infoText.bgClass, 'rounded-xl px-6 py-6 border-l-4', activeTab === 'goods' ? 'border-[#0e888d]' : 'border-[#f59e0b]']">
        <p class="text-[#415861] text-lg lg:text-xl leading-relaxed">
          {{ infoText.text }}
          <br>
          <span class="font-bold mt-2 inline-block text-xl lg:text-2xl">{{ infoText.formula }}</span>
        </p>
      </div>
    </div>

    <!-- Form for "Товары и упаковка" -->
    <div v-if="activeTab === 'goods'" class="container-main">
      <div class="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-6 lg:p-10">

        <!-- Step 1: Group Selection -->
        <div class="mb-8 lg:mb-10">
          <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0e888d] text-white text-base font-bold mr-3">1</span>
            Группа товаров/упаковки
          </label>
          <CustomSelect
            v-model="selectedGroupNumber"
            :options="groupOptions"
            placeholder="— Выберите группу —"
            :max-label-length="70"
          />
        </div>

        <!-- Step 2: Subgroup Selection -->
        <div class="mb-8 lg:mb-10">
          <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0e888d] text-white text-base font-bold mr-3">2</span>
            Подгруппа
          </label>
          <CustomSelect
            v-model="selectedSubgroupIndex"
            :options="subgroupOptions"
            :disabled="!selectedGroup"
            placeholder="— Выберите подгруппу —"
            :max-label-length="80"
          />
          <p class="text-base text-[#6b7280] mt-4 flex items-center gap-2">
            <span class="inline-block w-5 h-5 rounded bg-[#fef3c7] border border-[#f59e0b]"></span>
            Текст в【скобках】выделяет ключевые отличия между похожими позициями
          </p>
        </div>

        <!-- Step 3: TN VED Name (readonly) -->
        <div v-if="selectedSubgroup" class="mb-8 lg:mb-10">
          <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#6b7280] text-white text-base font-bold mr-3">3</span>
            {{ isPackaging ? 'Материал и обозначение упаковки' : 'Наименование позиции ТН ВЭД ЕАЭС' }}
          </label>
          <div class="w-full bg-[#f1f5f9] rounded-xl px-6 py-5 text-[#415861] text-lg lg:text-xl min-h-[70px] border-2 border-[#e2e8f0]">
            {{ tnVedNameDisplay || '—' }}
          </div>
          <p class="text-base text-[#6b7280] mt-4 italic">Поле заполняется автоматически на основе выбранной подгруппы</p>
        </div>

        <!-- Rate Display -->
        <div v-if="selectedSubgroup" class="mb-8 lg:mb-10 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl p-6 text-white text-center shadow-lg">
          <div class="text-base opacity-90 mb-2 font-medium">Ставка утилизационного сбора (Сус)</div>
          <div class="text-4xl lg:text-5xl font-bold">{{ formatNumber(currentRate, 0) }} <span class="text-2xl font-normal opacity-80">сом/тонн</span></div>
        </div>

        <!-- Mass and Year row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-10">
          <!-- Mass -->
          <div>
            <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
              Масса товара/упаковки (тонн) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="mass"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.000"
              class="calc-input"
            />
          </div>

          <!-- Year -->
          <div>
            <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
              Отчётный год <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <select v-model="year" class="calc-select-native">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
              <div class="select-arrow-native">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Operation type -->
        <div class="mb-8 lg:mb-10">
          <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
            Тип операции
          </label>
          <div class="relative">
            <select v-model="operationType" class="calc-select-native">
              <option v-for="op in operationTypes" :key="op.value" :value="op.value">
                {{ op.label }}
              </option>
            </select>
            <div class="select-arrow-native">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Self-processing checkbox -->
        <div class="mb-8 lg:mb-10">
          <label class="flex items-start gap-4 cursor-pointer p-5 rounded-xl hover:bg-[#f8fafc] transition-colors">
            <div
              :class="[
                'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5',
                selfProcessing
                  ? 'bg-[#0e888d] border-[#0e888d]'
                  : 'bg-white border-[#d1d5db] hover:border-[#0e888d]'
              ]"
              @click.stop="selfProcessing = !selfProcessing"
            >
              <svg v-if="selfProcessing" width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[#415861] text-lg lg:text-xl leading-relaxed">
              Самостоятельное выполнение нормативов переработки (п. 15 Порядка)
            </span>
          </label>
        </div>

        <!-- Partial processing section -->
        <div v-if="selfProcessing" class="mb-8 lg:mb-10 bg-[#fffbeb] border-2 border-[#f59e0b] rounded-xl p-6">
          <h3 class="text-xl lg:text-2xl font-bold text-[#92400e] mb-5">Расчёт при частичном выполнении норматива</h3>
          <div>
            <label class="block text-[#415861] text-lg lg:text-xl font-semibold mb-4">
              Фактически переработано (тонн)
            </label>
            <input
              v-model="processedAmount"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.000"
              class="calc-input bg-white"
            />
          </div>
        </div>

        <!-- Calculate button -->
        <button
          @click="handleCalculate"
          class="w-full bg-[#0e888d] text-white text-xl lg:text-2xl font-semibold py-5 lg:py-6 rounded-2xl hover:bg-[#0a6d71] transition-all shadow-lg hover:shadow-xl active:scale-[0.99]"
        >
          Рассчитать утилизационный сбор
        </button>
      </div>
    </div>

    <!-- Form for "Отходы (самостоятельная переработка)" -->
    <div v-else class="container-main">
      <div class="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-6 lg:p-10">

        <!-- Step 1: Group Selection -->
        <div class="mb-8 lg:mb-10">
          <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0e888d] text-white text-base font-bold mr-3">1</span>
            Группа товаров/упаковки
          </label>
          <CustomSelect
            v-model="wasteSelectedGroupNumber"
            :options="groupOptions"
            placeholder="— Выберите группу —"
            :max-label-length="70"
          />
        </div>

        <!-- Step 2: Subgroup Selection -->
        <div class="mb-8 lg:mb-10">
          <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0e888d] text-white text-base font-bold mr-3">2</span>
            Подгруппа
          </label>
          <CustomSelect
            v-model="wasteSelectedSubgroupIndex"
            :options="wasteSubgroupOptions"
            :disabled="!wasteSelectedGroup"
            placeholder="— Выберите подгруппу —"
            :max-label-length="80"
          />
        </div>

        <!-- Step 3: TN VED Name (readonly) -->
        <div v-if="wasteSelectedSubgroup" class="mb-8 lg:mb-10">
          <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#6b7280] text-white text-base font-bold mr-3">3</span>
            {{ wasteIsPackaging ? 'Материал и обозначение упаковки' : 'Наименование позиции ТН ВЭД ЕАЭС' }}
          </label>
          <div class="w-full bg-[#f1f5f9] rounded-xl px-6 py-5 text-[#415861] text-lg lg:text-xl min-h-[70px] border-2 border-[#e2e8f0]">
            {{ wasteTnVedNameDisplay || '—' }}
          </div>
          <p class="text-base text-[#6b7280] mt-4 italic">Поле заполняется автоматически</p>
        </div>

        <!-- Rate Display -->
        <div v-if="wasteSelectedSubgroup" class="mb-8 lg:mb-10 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl p-8 text-white text-center shadow-lg">
          <div class="text-lg lg:text-xl opacity-90 mb-3 font-medium">Ставка утилизационного сбора (Сус)</div>
          <div class="text-5xl lg:text-6xl font-bold">{{ formatNumber(wasteCurrentRate, 0) }} <span class="text-2xl lg:text-3xl font-normal opacity-80">сом/тонн</span></div>
        </div>

        <!-- Established and Actually processed row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-10">
          <!-- Established quantity -->
          <div>
            <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
              Установленное количество (Куст, тонн) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="establishedQty"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.000"
              class="calc-input"
            />
          </div>

          <!-- Actually processed -->
          <div>
            <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
              Фактически переработано (Кфакт, тонн) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="actuallyProcessed"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.000"
              class="calc-input"
            />
          </div>
        </div>

        <!-- Year -->
        <div class="mb-10 lg:mb-12">
          <label class="block text-[#415861] text-xl lg:text-2xl font-semibold mb-4">
            Отчетный год <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select v-model="wasteYear" class="calc-select-native">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
            <div class="select-arrow-native">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Calculate button -->
        <button
          @click="handleCalculateWaste"
          class="w-full bg-[#0e888d] text-white text-xl lg:text-2xl font-semibold py-5 lg:py-6 rounded-2xl hover:bg-[#0a6d71] transition-all shadow-lg hover:shadow-xl active:scale-[0.99]"
        >
          Рассчитать утилизационный сбор
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="showResults" class="container-main pt-10 lg:pt-14">
      <h2 class="text-2xl lg:text-3xl font-bold text-[#415861] uppercase mb-8">
        Результаты расчёта
      </h2>

      <!-- Goods Result Card (Groups 1-18) -->
      <div v-if="goodsResult" class="result-card">
        <div class="result-row">
          <span class="result-label">Группа</span>
          <span class="result-value">{{ goodsResult.group }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Подгруппа</span>
          <span class="result-value">{{ goodsResult.subgroup }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Код ГСКП (версия 3)</span>
          <span class="result-value font-mono">{{ goodsResult.gskpCode || '—' }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Код ТН ВЭД ЕАЭС</span>
          <span class="result-value font-mono">{{ goodsResult.tnVedCode || '—' }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Наименование позиции ТН ВЭД ЕАЭС</span>
          <span class="result-value">{{ goodsResult.tnVedName || '—' }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Масса (тонн)</span>
          <span class="result-value">{{ formatNumber(goodsResult.mass, 3) }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Ставка (сом/т)</span>
          <span class="result-value">{{ formatNumber(goodsResult.rate, 0) }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Норматив</span>
          <span class="result-value">{{ (goodsResult.normative * 100).toFixed(0) }}%</span>
        </div>
        <div class="result-row result-total">
          <span class="result-label-total">Итого сумма (сом)</span>
          <span class="result-value-total">{{ formatNumber(goodsResult.total, 2) }}</span>
        </div>
      </div>

      <!-- Packaging Result Card (Groups 19-24) -->
      <div v-if="packagingResult" class="result-card">
        <div class="result-row">
          <span class="result-label">Группа упаковки</span>
          <span class="result-value">{{ packagingResult.group }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Наименование упаковки</span>
          <span class="result-value">{{ packagingResult.packagingName }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Материал упаковки</span>
          <span class="result-value">{{ packagingResult.material || '—' }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Буквенное обозначение</span>
          <span class="result-value font-mono">{{ packagingResult.letterCode || '—' }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Цифровой код</span>
          <span class="result-value font-mono">{{ packagingResult.digitalCode || '—' }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Масса (тонн)</span>
          <span class="result-value">{{ formatNumber(packagingResult.mass, 3) }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Ставка (сом/т)</span>
          <span class="result-value">{{ formatNumber(packagingResult.rate, 0) }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Норматив</span>
          <span class="result-value">{{ (packagingResult.normative * 100).toFixed(0) }}%</span>
        </div>
        <div class="result-row result-total">
          <span class="result-label-total">Итого сумма (сом)</span>
          <span class="result-value-total">{{ formatNumber(packagingResult.total, 2) }}</span>
        </div>
      </div>

      <!-- Formula Explanation -->
      <div class="mt-8 bg-[#f8fafc] border-l-4 border-[#0e888d] rounded-r-xl p-6 lg:p-8">
        <div class="text-base lg:text-lg font-bold text-[#0e888d] uppercase mb-5 tracking-wide">Формула расчёта:</div>
        <div class="font-mono text-[#415861] text-lg lg:text-xl leading-relaxed">
          <template v-if="activeTab === 'goods'">
            <strong class="text-xl lg:text-2xl">Усб = Сус × Мтв/уп × Нпер</strong>
            <div class="mt-4 text-lg lg:text-xl bg-white rounded-lg p-5 border border-[#e5e7eb]">
              Усб = {{ formatNumber(goodsResult?.rate || packagingResult?.rate || 0, 0) }} ×
              {{ formatNumber(goodsResult?.mass || packagingResult?.mass || 0, 3) }} ×
              {{ goodsResult?.normative || packagingResult?.normative || 0 }} =
              <strong class="text-[#0e888d] text-2xl lg:text-3xl">{{ formatNumber(goodsResult?.total || packagingResult?.total || 0, 2) }} сом</strong>
            </div>
          </template>
          <template v-else>
            <strong class="text-xl lg:text-2xl">Усб = Сус × (Куст - Кфакт)</strong>
            <div class="mt-4 text-lg lg:text-xl bg-white rounded-lg p-5 border border-[#e5e7eb]">
              Усб = {{ formatNumber(goodsResult?.rate || packagingResult?.rate || 0, 0) }} ×
              {{ formatNumber(goodsResult?.mass || packagingResult?.mass || 0, 3) }} =
              <strong class="text-[#0e888d] text-2xl lg:text-3xl">{{ formatNumber(goodsResult?.total || packagingResult?.total || 0, 2) }} сом</strong>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calculator-page {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
}

.calc-select-native {
  width: 100%;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 55px 20px 24px;
  font-size: 18px;
  font-weight: 500;
  color: #415861;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.5;
}

.calc-select-native:hover {
  border-color: #0e888d;
}

.calc-select-native:focus {
  outline: none;
  border-color: #0e888d;
  box-shadow: 0 0 0 3px rgba(14, 136, 141, 0.1);
}

.calc-input {
  width: 100%;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
  font-size: 20px;
  font-weight: 500;
  color: #415861;
  transition: all 0.2s ease;
}

.calc-input:hover {
  border-color: #0e888d;
}

.calc-input:focus {
  outline: none;
  border-color: #0e888d;
  box-shadow: 0 0 0 3px rgba(14, 136, 141, 0.1);
}

.calc-input::placeholder {
  color: #9ca3af;
}

.select-arrow-native {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
}

@media (max-width: 768px) {
  .calc-select-native {
    padding: 18px 50px 18px 20px;
    font-size: 17px;
  }

  .calc-input {
    padding: 18px 20px;
    font-size: 18px;
  }
}

/* Result Card Styles */
.result-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  padding: 24px 28px;
  margin-bottom: 24px;
}

.result-row {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.result-row:last-child {
  border-bottom: none;
}

.result-label {
  font-size: 17px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 8px;
}

.result-value {
  font-size: 18px;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
}

.result-total {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  margin: 20px -28px -24px -28px;
  padding: 24px 28px;
  border-radius: 0 0 16px 16px;
  border-bottom: none;
}

.result-label-total {
  font-size: 18px;
  color: #047857;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-value-total {
  font-size: 38px;
  color: #047857;
  font-weight: 800;
  line-height: 1.2;
}

@media (min-width: 640px) {
  .result-row {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .result-label {
    flex-shrink: 0;
    width: 280px;
    margin-bottom: 0;
  }

  .result-value {
    text-align: right;
    flex: 1;
  }

  .result-total {
    flex-direction: row;
    align-items: center;
  }

  .result-label-total {
    margin-bottom: 0;
  }

  .result-value-total {
    font-size: 42px;
  }
}
</style>
