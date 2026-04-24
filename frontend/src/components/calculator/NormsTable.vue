<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
  currentYear: number
}>()

// Нормативы переработки по годам (из ПКМ КР).
const rows = [
  { year: 2025, g14: 20, g524: 10 },
  { year: 2026, g14: 30, g524: 20 },
  { year: 2027, g14: 50, g524: 40 },
  { year: 2028, g14: 60, g524: 50 },
  { year: 2029, g14: 70, g524: 70 },
  { year: 2030, g14: 80, g524: 80 },
]
</script>

<template>
  <div class="bg-white rounded-2xl border border-ink-200 p-5">
    <h4 class="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-semibold mb-3">
      {{ t('calculatorPage.normsByYears') }}
    </h4>
    <table class="w-full text-[12px]">
      <thead>
        <tr class="text-ink-400 border-b border-ink-100">
          <th class="text-left pb-1.5 font-medium">{{ t('calculatorPage.year') }}</th>
          <th class="text-right pb-1.5 font-medium">{{ t('calculatorPage.groups14') }}</th>
          <th class="text-right pb-1.5 font-medium">{{ t('calculatorPage.groups524') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in rows"
          :key="r.year"
          :class="[
            'border-b border-ink-50 last:border-0',
            r.year === props.currentYear ? 'bg-brand-50 font-semibold text-brand-800' : 'text-ink-600'
          ]"
        >
          <td class="py-1.5">{{ r.year }}</td>
          <td class="py-1.5 text-right tabular-nums">{{ r.g14 }}%</td>
          <td class="py-1.5 text-right tabular-nums">{{ r.g524 }}%</td>
        </tr>
      </tbody>
    </table>
    <p class="text-[10px] text-ink-400 mt-3 leading-relaxed">
      {{ t('calculatorPage.groups14desc') }}<br/>
      {{ t('calculatorPage.groups524desc') }}
    </p>
  </div>
</template>
