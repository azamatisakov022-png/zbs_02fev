<script setup lang="ts">
import { AppButton } from '@/components/ui'
import type { CalculatorProductItem, PayerType } from '@/types/calculator'
import type { ProductSubgroupDTO } from '@/types/product-group'
import ProductGroupSelector from '@/components/ProductGroupSelector.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { calculateAmount, getVolumeError, getNormStatus, getRemaining } from '@/helpers/calculatorHelpers'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  item: CalculatorProductItem
  index: number
  payerType: PayerType
  formSubmitted: boolean
  formErrors: Record<string, string>
  validationErrors: Record<string, string>
  canRemove: boolean
}>()

const emit = defineEmits<{
  (e: 'update:item', item: CalculatorProductItem): void
  (e: 'remove', id: number): void
  (e: 'group-changed', item: CalculatorProductItem): void
  (e: 'subgroup-changed', item: CalculatorProductItem): void
  (e: 'clear-validation', key: string): void
}>()

const onVolumeInput = () => {
  calculateAmount(props.item)
  emit('clear-validation', `product_${props.index}_volume`)
}

const onTransferredInput = () => {
  calculateAmount(props.item)
}

const onExportedInput = () => {
  calculateAmount(props.item)
}

const handleRecycledFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    props.item.recycledFile = { name: file.name, file }
  }
  input.value = ''
}

const removeRecycledFile = () => {
  props.item.recycledFile = null
}

const handleExportedFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    props.item.exportedFile = { name: file.name, file }
  }
  input.value = ''
}

const removeExportedFile = () => {
  props.item.exportedFile = null
}

const volumeError = () => getVolumeError(props.item, t('businessCalc.volumeExceedError'))

const normStatus = () => getNormStatus(
  props.item,
  t('businessCalc.normMet'),
  t('businessCalc.normNotMet', { volume: props.item.taxableVolume.toFixed(2) })
)

const remaining = () => getRemaining(props.item)

</script>

<template>
  <div class="cf-card">
    <div class="flex items-center justify-between mb-4">
      <span class="pic-text font-semibold text-slate-800">{{ $t('businessCalc.positionN', { n: index + 1 }) }}</span>
      <AppButton
        v-if="canRemove"
        variant="icon-danger"
        size="sm"
        @click="emit('remove', item.id)"
        :title="$t('businessCalc.deletePosition')"
        :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16&quot; /></svg>'"
      />
    </div>

    <div class="cf-info">
      <ProductGroupSelector
        :group="item.group"
        :subgroup="item.subgroup"
        @update:group="(v: string) => { item.group = v; item.subgroup = ''; item.tnvedCode = ''; emit('group-changed', item) }"
        @update:subgroup="(v: string) => { item.subgroup = v; emit('subgroup-changed', item) }"
        @subgroup-selected="(data: ProductSubgroupDTO | null) => { if (data) item.tnvedCode = data.tnvedCode || '' }"
        accent-color="#f59e0b"
      />
      <p v-if="validationErrors[`product_${index}_group`]" class="mt-1 pic-text font-semibold text-red-500">{{ validationErrors[`product_${index}_group`] }}</p>
      <p v-else-if="formSubmitted && formErrors[`product_${index}_group`]" class="vld-error" data-validation-error>
        <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_group`] }}
      </p>

      <div v-if="payerType === 'producer' && item.group" class="mt-3">
        <AppInput
          :label="$t('businessCalc.gskpCodeLabel')"
          :modelValue="item.gskpCode"
          @update:modelValue="(v: string | number) => { item.gskpCode = String(v) }"
          :placeholder="$t('businessCalc.gskpCodePlaceholder')"
        />
      </div>
    </div>

    <div class="cf-data" v-if="item.group">
      <div class="cf-data__header">{{ $t('businessCalc.calcDataHeader') }}</div>

      <div class="cf-data__grid">
        <label class="cf-data__label">{{ $t('businessCalc.volumeLabel') }}</label>
        <label class="cf-data__label">{{ $t('businessCalc.transferredLabel') }}</label>
        <label class="cf-data__label">{{ $t('businessCalc.exportedLabel') }}</label>

        <div class="cf-data__field">
          <AppInput
            type="number"
            :modelValue="item.volume"
            @update:modelValue="(v: string | number) => { item.volume = String(v); onVolumeInput() }"
            placeholder="0.00"
            :hint="$t('businessCalc.volumeHint')"
            :error="validationErrors[`product_${index}_volume`] || (formSubmitted && formErrors[`product_${index}_volume`] ? formErrors[`product_${index}_volume`] : '')"
            hide-label
          />
        </div>
        <div class="cf-data__field">
          <AppInput
            type="number"
            :modelValue="item.transferredToRecycling"
            @update:modelValue="(v: string | number) => { item.transferredToRecycling = String(v); onTransferredInput() }"
            placeholder="0.00"
            :hint="$t('businessCalc.transferredHint')"
            :error="volumeError() || (formSubmitted && formErrors[`product_${index}_transferred`] ? formErrors[`product_${index}_transferred`] : '')"
            hide-label
          />
        </div>
        <div class="cf-data__field">
          <AppInput
            type="number"
            :modelValue="item.exportedFromKR"
            @update:modelValue="(v: string | number) => { item.exportedFromKR = String(v); onExportedInput() }"
            placeholder="0.00"
            :hint="$t('businessCalc.exportedHint')"
            :error="volumeError() || (formSubmitted && formErrors[`product_${index}_exported`] ? formErrors[`product_${index}_exported`] : '')"
            hide-label
          />
        </div>
      </div>

      <div class="fc-row">
        <input :id="'recycled-file-' + item.id" type="file" class="hidden" @change="handleRecycledFileSelect($event)" />
        <label v-if="!item.recycledFile" :for="'recycled-file-' + item.id" :class="['fc-card', (parseFloat(item.transferredToRecycling) || 0) > 0 ? 'fc-card--warn' : '']">
          <div class="fc-card__icon fc-card__icon--blue">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div class="fc-card__text">
            <span class="fc-card__title">{{ $t('businessCalc.recyclingContract') }}</span>
            <span class="fc-card__desc">{{ $t('businessCalc.fileHint') }}</span>
          </div>
          <span class="fc-card__btn">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {{ $t('businessCalc.uploadBtn') }}
          </span>
        </label>
        <div v-else class="fc-card fc-card--done">
          <div class="fc-card__icon fc-card__icon--green">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div class="fc-card__text">
            <span class="fc-card__title">{{ item.recycledFile.name }}</span>
            <span class="fc-card__desc fc-card__desc--green">{{ $t('businessCalc.uploaded') }}</span>
          </div>
          <AppButton
            variant="icon-danger"
            size="sm"
            @click="removeRecycledFile"
            :title="$t('businessCalc.deleteFile')"
            :icon="'<svg width=&quot;16&quot; height=&quot;16&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'"
          />
        </div>

        <input :id="'exported-file-' + item.id" type="file" class="hidden" @change="handleExportedFileSelect($event)" />
        <label v-if="!item.exportedFile" :for="'exported-file-' + item.id" :class="['fc-card', (parseFloat(item.exportedFromKR) || 0) > 0 ? 'fc-card--warn' : '']">
          <div class="fc-card__icon fc-card__icon--purple">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </div>
          <div class="fc-card__text">
            <span class="fc-card__title">{{ $t('businessCalc.gtdExport') }}</span>
            <span class="fc-card__desc">{{ $t('businessCalc.fileHint') }}</span>
          </div>
          <span class="fc-card__btn">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {{ $t('businessCalc.uploadBtn') }}
          </span>
        </label>
        <div v-else class="fc-card fc-card--done">
          <div class="fc-card__icon fc-card__icon--green">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div class="fc-card__text">
            <span class="fc-card__title">{{ item.exportedFile.name }}</span>
            <span class="fc-card__desc fc-card__desc--green">{{ $t('businessCalc.uploaded') }}</span>
          </div>
          <AppButton
            variant="icon-danger"
            size="sm"
            @click="removeExportedFile"
            :title="$t('businessCalc.deleteFile')"
            :icon="'<svg width=&quot;16&quot; height=&quot;16&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'"
          />
        </div>
      </div>

      <div v-if="volumeError()" class="norm-msg norm-msg--error" data-validation-error>
        <svg class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        {{ volumeError() }}
      </div>
      <p v-else-if="formSubmitted && formErrors[`product_${index}_sum`]" class="vld-error mt-3" data-validation-error>
        <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_sum`] }}
      </p>

      <div v-else-if="normStatus()" :class="['norm-msg', normStatus()!.met ? 'norm-msg--success' : 'norm-msg--warning']">
        <svg v-if="normStatus()!.met" class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <svg v-else class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {{ normStatus()!.message }}
      </div>

      <div class="cf-data__computed">
        <div class="cf-data__computed-cell cc-slate">
          <span class="cf-data__computed-label">{{ $t('businessCalc.normLabel') }}</span>
          <span class="cf-data__computed-value">{{ item.recyclingStandard ? item.recyclingStandard + '%' : '—' }}</span>
        </div>
        <div class="cf-data__computed-cell cc-indigo">
          <span class="cf-data__computed-label">{{ $t('businessCalc.toRecycleLabel') }}</span>
          <span class="cf-data__computed-value text-indigo-500">{{ item.volumeToRecycle ? item.volumeToRecycle.toFixed(2) + ' ' + $t('businessCalc.ton') : '0.00 ' + $t('businessCalc.ton') }}</span>
        </div>
        <div class="cf-data__computed-cell cc-blue">
          <span class="cf-data__computed-label">{{ $t('businessCalc.taxableVolumeLabel') }}</span>
          <span class="cf-data__computed-value">{{ item.taxableVolume ? item.taxableVolume.toFixed(2) + ' ' + $t('businessCalc.ton') : '0.00 ' + $t('businessCalc.ton') }}</span>
        </div>
        <div class="cf-data__computed-cell cc-emerald">
          <span class="cf-data__computed-label">{{ $t('businessCalc.remainingLabel') }}</span>
          <span :class="['cf-data__computed-value', remaining() <= 0 ? 'text-emerald-600' : 'text-amber-600']">{{ remaining().toFixed(2) }} {{ $t('businessCalc.ton') }}</span>
        </div>
        <div class="cf-data__computed-cell cc-amber">
          <span class="cf-data__computed-label">{{ $t('businessCalc.rateLabel') }}</span>
          <span class="cf-data__computed-value text-amber-600">{{ item.rate.toLocaleString() }} {{ $t('businessCalc.somPerTon') }}</span>
        </div>
      </div>

      <div class="cf-data__summary">
        <span class="cf-data__summary-label">{{ $t('businessCalc.amountLabel') }}</span>
        <span class="cf-data__summary-value">{{ item.amount.toLocaleString() }} {{ $t('businessCalc.som') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fc-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--color-slate-200);
}
.fc-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1.5px dashed var(--color-slate-300);
  border-radius: 12px;
  padding: 16px 20px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 280px;
}
.fc-card:hover {
  border-color: #3B82F6;
  background: var(--color-slate-50);
  box-shadow: 0 2px 8px rgba(59,130,246,0.08);
}
.fc-card--warn {
  border-color: #FBBF24;
  background: #FFFBEB;
}
.fc-card--warn:hover {
  border-color: var(--color-calc-accent);
  background: #FEF3C7;
}
.fc-card--done {
  border: 1.5px solid #D1FAE5;
  background: #F0FDF4;
  cursor: default;
}
.fc-card--done:hover {
  border-color: #D1FAE5;
  background: #F0FDF4;
  box-shadow: none;
}
.fc-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fc-card__icon--blue { background: var(--color-slate-100); color: #3B82F6; }
.fc-card__icon--purple { background: var(--color-slate-100); color: #8B5CF6; }
.fc-card__icon--green { background: #D1FAE5; color: #059669; }
.fc-card__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.fc-card__title {
  font-weight: 600;
  font-size: 18px;
  color: var(--color-slate-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fc-card__desc { font-size: 16px; color: var(--color-slate-600); margin-top: 2px; font-weight: 500; }
.fc-card__desc--green { color: #059669; font-weight: 600; }
.fc-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #EFF6FF;
  color: #3B82F6;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.fc-card:hover .fc-card__btn { background: #3B82F6; color: white; }
.fc-card--warn .fc-card__btn { background: #FEF3C7; color: var(--color-calc-accent-dark); }
.fc-card--warn:hover .fc-card__btn { background: var(--color-calc-accent); color: white; }


.cf-card {
  background: white;
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 16px;
}
.cf-info {
  background: var(--color-slate-50);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}
.cf-data { border-top: 2px solid var(--color-calc-accent); padding-top: 16px; }
.cf-data__header {
  font-size: 18px; font-weight: 700; color: var(--color-calc-accent);
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;
}
.cf-data__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 16px;
}
.cf-data__label {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  align-self: end;
  line-height: 1.3;
}
.cf-data__field { min-width: 0; }
.cf-data__field :deep(.app-input__field) {
  padding: 12px 16px;
  font-size: 20px;
  font-weight: 600;
  -moz-appearance: textfield;
}
.cf-data__field :deep(.app-input__field::-webkit-inner-spin-button),
.cf-data__field :deep(.app-input__field::-webkit-outer-spin-button) {
  -webkit-appearance: none; margin: 0;
}
.cf-data__field :deep(.app-input__field:focus) {
  border-color: var(--color-calc-accent);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.norm-msg {
  display: flex; align-items: center; gap: 8px; margin-top: 12px;
  padding: 10px 14px; border-radius: var(--radius-md); font-size: 20px;
  font-weight: 700; line-height: 1.4;
}
.norm-msg__icon { flex-shrink: 0; }
.norm-msg--success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; }
.norm-msg--warning { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
.norm-msg--error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }

.cf-data__computed {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
  margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--color-slate-200);
}
.cf-data__computed-cell {
  display: flex; flex-direction: column; gap: 4px;
  border-radius: var(--radius-md); padding: 12px 14px;
}
.cf-data__computed-label {
  font-size: 14px; text-transform: uppercase; color: var(--color-slate-600);
  font-weight: 600; letter-spacing: 0.3px;
}
.cf-data__computed-value { font-size: 20px; font-weight: 700; color: var(--color-slate-800); }

.cc-slate { background: var(--color-slate-100); }
.cc-indigo { background: #eef2ff; }
.cc-blue { background: #eff6ff; }
.cc-emerald { background: #ecfdf5; }
.cc-amber { background: #fffbeb; }

.cf-data__summary {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 8px; margin-top: 16px; padding: 14px 20px;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.08));
  border-radius: var(--radius-md); border: 1px solid rgba(245,158,11,0.15);
}
.cf-data__summary-label { font-weight: 700; font-size: 20px; color: var(--color-slate-800); }
.cf-data__summary-value { font-weight: 800; font-size: 24px; color: var(--color-calc-accent); }

@media (max-width: 640px) {
  .cf-data__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px 0;
  }
  .cf-data__label { margin-top: 12px; }
  .cf-data__label:first-child { margin-top: 0; }
  .cf-data__computed { grid-template-columns: repeat(2, 1fr); }
  .cf-data__summary { flex-direction: column; align-items: flex-start; }
  .fc-card { min-width: 0; padding: 12px 14px; gap: 10px; }
  .fc-card__icon { width: 36px; height: 36px; }
  .fc-card__icon svg { width: 16px; height: 16px; }
  .fc-card__btn { padding: 6px 12px; font-size: 12px; }
}

.pic-text {
  font-size: 20px;
}
</style>
