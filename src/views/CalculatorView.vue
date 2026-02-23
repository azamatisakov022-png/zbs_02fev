<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/general/Button.vue'
import Select from '@/components/ui/general/Select.vue'
import Input from '@/components/ui/general/Input.vue'

const { t } = useI18n()

const activeTab = ref<'goods' | 'waste'>('goods')
const selfProcessing = ref(true)

const selectedCategory = ref('')
const selectedYear = ref('2027')
const selectedOperation = ref('import')
const goodsMass = ref(12)
const goodsProcessed = ref(0)

const selectedWasteCategory = ref('')
const selectedWasteYear = ref('2025')
const wasteEstablished = ref(12)
const wasteActual = ref(0)

const categoryOptions = computed(() => [
  { value: '', label: t('calc.categoryOptions.all') },
  { value: 'plastic', label: t('calc.categoryOptions.plastic') },
  { value: 'glass', label: t('calc.categoryOptions.glass') },
  { value: 'paper', label: t('calc.categoryOptions.paper') },
  { value: 'metal', label: t('calc.categoryOptions.metal') },
])

const yearOptions = [
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
]

const operationOptions = computed(() => [
  { value: 'import', label: t('calc.operationOptions.import') },
  { value: 'production', label: t('calc.operationOptions.production') },
])

const wasteCategoryOptions = computed(() => [
  { value: '', label: t('calc.wasteCategoryOptions.all') },
  { value: 'solid', label: t('calc.wasteCategoryOptions.solid') },
  { value: 'industrial', label: t('calc.wasteCategoryOptions.industrial') },
  { value: 'construction', label: t('calc.wasteCategoryOptions.construction') },
])
</script>

<template>
  <div class="container-main">
  <div class="calculator-container">
    <div class="calc-header">
      <div class="flex flex-col gap-3">
        <h1 class="calc-main-title">{{ $t('calc.title') }}</h1>
        <p class="calc-main-subtitle">
          {{ $t('calc.subtitle') }}
        </p>
      </div>
    </div>

    <div class="calc-tabs-wrapper">
      <div class="calc-tabs-bg">
        <button
          @click="activeTab = 'goods'"
          :class="['calc-tab-btn', activeTab === 'goods' ? 'is-active' : 'is-inactive']"
        >
          {{ $t('calc.tabGoods') }}
        </button>
        <button
          @click="activeTab = 'waste'"
          :class="['calc-tab-btn', activeTab === 'waste' ? 'is-active' : 'is-inactive']"
        >
          {{ $t('calc.tabWaste') }}
        </button>
      </div>
    </div>

    <div class="calc-info-section">
      <div v-if="activeTab === 'goods'" class="calc-info-alert alert-goods">
        <p class="calc-info-text">
          {{ $t('calc.goodsInfo') }}
          <br />
          <span class="font-bold">{{ $t('calc.goodsFormula') }}</span>
        </p>
      </div>
      <div v-else class="calc-info-alert alert-waste">
        <p class="calc-info-text">
          {{ $t('calc.wasteInfo') }}
          <br />
          <span class="font-bold">{{ $t('calc.wasteFormula') }}</span>
        </p>
      </div>
    </div>

    <div class="calc-form">
      <div class="calc-form-grid">
        <template v-if="activeTab === 'goods'">
          <Select
            v-model="selectedCategory"
            :options="categoryOptions"
            :placeholder="$t('calc.categoryPlaceholder')"
            variant="form"
            :label="$t('calc.categoryLabel')"
          />

          <div class="calc-row">
            <div class="calc-field flex-1">
              <label class="calc-label">{{ $t('calc.massLabel') }}</label>
              <Input
                v-model="goodsMass"
                type="number"
                variant="filled"
              >
                <template #suffix>
                  <div class="calc-spinners">
                    <i class="icon-up"></i>
                    <i class="icon-down"></i>
                  </div>
                </template>
              </Input>
            </div>

            <Select
              v-model="selectedYear"
              :options="yearOptions"
              placeholder="2027"
              variant="form"
              :label="$t('calc.yearLabel')"
              class="flex-1"
            />
          </div>

          <Select
            v-model="selectedOperation"
            :options="operationOptions"
            :placeholder="$t('calc.operationPlaceholder')"
            variant="form"
            :label="$t('calc.operationLabel')"
          />

          <div class="calc-checkbox-wrapper">
            <button
              @click="selfProcessing = !selfProcessing"
              :class="['calc-checkbox', { 'is-checked': selfProcessing }]"
            >
              <svg v-if="selfProcessing" width="20" height="16" viewBox="0 0 20 16" fill="none">
                <path d="M2 8L7.5 13.5L18 2" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <span class="calc-checkbox-label">
              {{ $t('calc.selfProcessing') }}
            </span>
          </div>

          <h2 class="calc-section-subtitle mt-[30px]">
            {{ $t('calc.partialTitle') }}
          </h2>

          <div class="calc-field">
            <label class="calc-label">{{ $t('calc.processedLabel') }}</label>
            <Input
              v-model="goodsProcessed"
              type="number"
              step="0.01"
              variant="filled"
            >
              <template #suffix>
                <div class="calc-spinners">
                  <i class="icon-up"></i>
                  <i class="icon-down"></i>
                </div>
              </template>
            </Input>
          </div>
        </template>

        <template v-else>
          <Select
            v-model="selectedWasteCategory"
            :options="wasteCategoryOptions"
            :placeholder="$t('calc.categoryPlaceholder')"
            variant="form"
            :label="$t('calc.wasteCategoryLabel')"
          />

          <div class="calc-row">
            <div class="calc-field flex-1">
              <label class="calc-label">{{ $t('calc.establishedLabel') }}</label>
              <Input
                v-model="wasteEstablished"
                type="number"
                variant="filled"
              >
                <template #suffix>
                  <div class="calc-spinners">
                    <i class="icon-up"></i>
                    <i class="icon-down"></i>
                  </div>
                </template>
              </Input>
            </div>
            <div class="calc-field flex-1">
              <label class="calc-label">{{ $t('calc.actualProcessedLabel') }}</label>
              <Input
                v-model="wasteActual"
                type="number"
                variant="filled"
              >
                <template #suffix>
                  <div class="calc-spinners">
                    <i class="icon-up"></i>
                    <i class="icon-down"></i>
                  </div>
                </template>
              </Input>
            </div>
          </div>

          <Select
            v-model="selectedWasteYear"
            :options="yearOptions"
            placeholder="2025"
            variant="form"
            :label="$t('calc.wasteYearLabel')"
          />
        </template>

        <Button variant="primary" size="lg" class="calc-submit-btn">
          {{ $t('calc.submitBtn') }}
        </Button>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped src="@/assets/styles/views/calculator.css"></style>