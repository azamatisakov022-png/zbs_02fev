<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authStore } from '../stores/auth'

const router = useRouter()
const { t } = useI18n()

const isEsiLoading = ref(false)
const loginForm = ref({
  inn: '',
  password: '',
})
const loginError = ref('')

const handleEsiLogin = async () => {
  isEsiLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  isEsiLoading.value = false
  // ESI Tunduk — not implemented yet, redirect to home
  router.push('/')
}

const handlePasswordLogin = async () => {
  loginError.value = ''
  if (!loginForm.value.inn.trim() || !loginForm.value.password.trim()) {
    loginError.value = t('login.fillAllFields')
    return
  }

  try {
    const user = await authStore.login(loginForm.value.inn, loginForm.value.password)
    const dashboard = authStore.getRoleDashboard(user.role)
    await router.push(dashboard)
  } catch (err: any) {
    loginError.value = err.message || t('login.invalidInnOrPassword')
  }
}

const goBack = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-[calc(100vh-300px)] py-10 lg:py-[60px] flex flex-col">
    <div class="container-main">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-2 lg:mb-[12px]">
        <button
          @click="goBack"
          class="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center hover:bg-[#e8f5f5] transition-colors"
        >
          <svg class="w-5 h-5 text-[#415861]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase">
          {{ $t('login.title') }}
        </h1>
      </div>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861] ml-14">
        {{ $t('login.subtitle') }}
      </p>
    </div>

    <div class="container-main pt-8 lg:pt-[60px] flex-1 flex items-center justify-center">
      <div class="w-full max-w-md">
        <!-- ESI Loading Overlay -->
        <div v-if="isEsiLoading" class="text-center py-12">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-[#e8f5f5] flex items-center justify-center">
            <svg class="w-10 h-10 text-[#0e888d] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-[#415861] mb-2">{{ $t('login.connectingToEsi') }}</h2>
          <p class="text-[#70868f]">{{ $t('login.redirectingToAuth') }}</p>
        </div>

        <!-- Login Form -->
        <div v-else class="space-y-6">
          <!-- ESI Button -->
          <button
            @click="handleEsiLogin"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0e888d] hover:bg-[#0a6b6f] text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <!-- Tunduk shield icon -->
            <svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.57-3.77-1.21-7-5.74-7-10.57V6.3l7-3.12zM12 7a3 3 0 00-3 3v1H8v6h8v-6h-1v-1a3 3 0 00-3-3zm0 1.5a1.5 1.5 0 011.5 1.5v1h-3v-1A1.5 1.5 0 0112 8.5z"/>
            </svg>
            {{ $t('login.loginViaEsi') }}
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-4">
            <div class="flex-1 h-px bg-[#e2e8f0]"></div>
            <span class="text-sm text-[#70868f] font-medium">{{ $t('login.or') }}</span>
            <div class="flex-1 h-px bg-[#e2e8f0]"></div>
          </div>

          <!-- Password Login Form -->
          <div class="bg-[#f8fafc] rounded-2xl p-6 space-y-4">
            <h3 class="text-[#415861] font-semibold text-center mb-2">{{ $t('login.loginByInn') }}</h3>

            <div>
              <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('login.innOrganization') }}</label>
              <input
                v-model="loginForm.inn"
                type="text"
                maxlength="14"
                placeholder="12345678901234"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20 font-mono"
                @keyup.enter="handlePasswordLogin"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('login.password') }}</label>
              <input
                v-model="loginForm.password"
                type="password"
                :placeholder="$t('login.enterPassword')"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20"
                @keyup.enter="handlePasswordLogin"
              />
            </div>

            <p v-if="loginError" class="text-sm text-red-600">{{ loginError }}</p>

            <button
              @click="handlePasswordLogin"
              :disabled="authStore.state.loading"
              class="w-full px-6 py-3 bg-[#415861] hover:bg-[#2d3e45] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ authStore.state.loading ? $t('login.loading') : $t('login.submit') }}
            </button>
          </div>

          <!-- Register Link -->
          <div class="text-center">
            <p class="text-[#70868f] text-sm">
              {{ $t('login.noAccount') }}
              <router-link to="/register" class="text-[#0e888d] font-medium hover:underline">
                {{ $t('login.register') }}
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
