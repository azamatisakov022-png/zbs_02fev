<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton } from '../../components/ui'
import AppInput from '../../components/ui/AppInput.vue'
import AppCard from '../../components/ui/AppCard.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { contestStore } from '../../stores/contests'
import { toastStore } from '../../stores/toast'

const { roleTitle, menuItems } = useEcoOperatorMenu()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const id = computed(() => Number(route.params.id))

const title = ref('')
const description = ref('')
const conditions = ref('')
const grantAmount = ref<number | ''>('')
const grantCurrency = ref('KGS')
const deadline = ref('')
const errors = ref<Record<string, string>>({})
const loading = ref(false)
const uploadingFile = ref(false)
const regulationsFileName = ref('')
const hasRegulations = ref(false)

onMounted(async () => {
  if (isEdit.value) {
    const c = await contestStore.fetchById(id.value)
    if (c) {
      title.value = c.title
      description.value = c.description
      conditions.value = c.conditions || ''
      grantAmount.value = c.grantAmount ?? ''
      grantCurrency.value = c.grantCurrency || 'KGS'
      // Преобразуем ISO -> "yyyy-MM-ddTHH:mm" для input[type=datetime-local]
      deadline.value = c.deadline ? c.deadline.slice(0, 16) : ''
      regulationsFileName.value = c.regulationsFileName || ''
      hasRegulations.value = !!c.hasRegulations
    }
  }
})

const validate = (): boolean => {
  errors.value = {}
  if (!title.value.trim()) errors.value.title = 'Укажите название'
  if (!description.value.trim()) errors.value.description = 'Укажите описание'
  if (!deadline.value) errors.value.deadline = 'Укажите срок'
  return Object.keys(errors.value).length === 0
}

const onSave = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const payload = {
      title: title.value.trim(),
      description: description.value.trim(),
      conditions: conditions.value.trim() || undefined,
      grantAmount: grantAmount.value === '' ? undefined : Number(grantAmount.value),
      grantCurrency: grantCurrency.value,
      deadline: deadline.value,
    }
    if (isEdit.value) {
      await contestStore.update(id.value, payload as any)
    } else {
      const created = await contestStore.create(payload as any)
      // Перейдём в режим редактирования, чтобы можно было загрузить положение
      router.replace(`/eco-operator/contests/${created.id}/edit`)
    }
    toastStore.show({ type: 'success', title: t('contests.employee.saveSuccess') })
  } catch (e: any) {
    toastStore.show({ type: 'error', title: t('contests.employee.saveFailed'),
      message: e?.response?.data?.message || '' })
  } finally {
    loading.value = false
  }
}

const onFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  if (!isEdit.value) {
    toastStore.show({ type: 'warning', title: 'Сначала сохраните конкурс' })
    input.value = ''
    return
  }
  uploadingFile.value = true
  try {
    const updated = await contestStore.uploadRegulations(id.value, file)
    regulationsFileName.value = updated.regulationsFileName || ''
    hasRegulations.value = true
    toastStore.show({ type: 'success', title: t('contests.employee.uploadSuccess') })
  } catch (e: any) {
    toastStore.show({ type: 'error', title: t('contests.employee.saveFailed'),
      message: e?.response?.data?.message || '' })
  } finally {
    uploadingFile.value = false
    input.value = ''
  }
}
</script>

<template>
  <DashboardLayout :roleTitle="roleTitle" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <button @click="router.push('/eco-operator/contests')"
                class="inline-flex items-center gap-2 text-[#2D8B4E] hover:text-[#236B3E] font-medium mb-3 text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ $t('contests.detail.backToList') }}
        </button>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
          {{ isEdit ? $t('contests.employee.editTitle') : $t('contests.employee.createTitle') }}
        </h1>
      </div>

      <!-- Form -->
      <AppCard padding="lg">
        <form @submit.prevent="onSave" class="space-y-5">
          <AppInput v-model="title" :label="$t('contests.employee.fieldTitle')" :error="errors.title" required />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('contests.employee.fieldDescription') }} <span class="text-red-500">*</span>
            </label>
            <textarea v-model="description" rows="5"
                      class="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B4E]/30 focus:border-[#2D8B4E] resize-y"
                      :class="errors.description ? 'border-red-300' : 'border-[#e2e8f0]'" />
            <p v-if="errors.description" class="mt-1 text-sm text-red-500">{{ errors.description }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('contests.employee.fieldConditions') }}
            </label>
            <textarea v-model="conditions" rows="4"
                      class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B4E]/30 focus:border-[#2D8B4E] resize-y" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppInput v-model.number="grantAmount" type="number"
                      :label="$t('contests.employee.fieldGrantAmount')" />
            <AppInput v-model="grantCurrency"
                      :label="$t('contests.employee.fieldGrantCurrency')" />
            <AppInput v-model="deadline" type="datetime-local"
                      :label="$t('contests.employee.fieldDeadline')"
                      :error="errors.deadline" required />
          </div>

          <div class="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <AppButton type="submit" label="Сохранить" variant="primary" :loading="loading" />
            <AppButton type="button" label="Отмена" variant="ghost"
                       @click="router.push('/eco-operator/contests')" />
          </div>
        </form>
      </AppCard>

      <!-- Regulations upload (только при редактировании) -->
      <AppCard v-if="isEdit" padding="lg">
        <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          {{ $t('contests.employee.fieldRegulations') }}
        </h3>

        <div v-if="hasRegulations" class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-3">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-sm text-gray-700">{{ regulationsFileName }}</span>
          </div>
        </div>

        <label class="inline-flex items-center gap-2 px-4 py-2 bg-[#2D8B4E] text-white rounded-lg cursor-pointer hover:bg-[#236B3E] transition-colors text-sm font-medium">
          <span v-if="uploadingFile">...</span>
          <span v-else>📎 {{ $t('contests.employee.uploadRegulations') }}</span>
          <input type="file" class="hidden" @change="onFileSelect" accept=".pdf" :disabled="uploadingFile" />
        </label>
      </AppCard>
    </div>
  </DashboardLayout>
</template>
