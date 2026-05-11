<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

interface Role {
  id: string
  tag: string
  title: string
  description: string
  icon: string
}

const roles = computed<Role[]>(() => [
  {
    id: 'admin',
    tag: t('roleSelection.roles.admin.tag'),
    title: t('roleSelection.roles.admin.title'),
    description: t('roleSelection.roles.admin.description'),
    icon: 'gear'
  },
  {
    id: 'employee',
    tag: t('roleSelection.roles.employee.tag'),
    title: t('roleSelection.roles.employee.title'),
    description: t('roleSelection.roles.employee.description'),
    icon: 'id-card'
  },
  {
    id: 'eco-operator',
    tag: t('roleSelection.roles.ecoOperator.tag'),
    title: t('roleSelection.roles.ecoOperator.title'),
    description: t('roleSelection.roles.ecoOperator.description'),
    icon: 'recycle'
  },
  {
    id: 'business',
    tag: t('roleSelection.roles.business.tag'),
    title: t('roleSelection.roles.business.title'),
    description: t('roleSelection.roles.business.description'),
    icon: 'briefcase'
  }
])

// Per-role accent palette. Keys map to role.id.
// Tailwind classes are written out in full (no string interpolation in `class`)
// so the JIT picks them up.
interface RoleAccent {
  bg: string          // pale fill for icon circle (idle)
  text: string        // icon + CTA text color (idle)
  iconHoverBg: string // solid fill for icon circle on hover
  dot: string         // top-left indicator dot + side stripe
  border: string      // card border on hover
  shadow: string      // colored shadow on hover
}

const roleAccent: Record<string, RoleAccent> = {
  admin: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    iconHoverBg: 'group-hover:bg-slate-600',
    dot: 'bg-slate-500',
    border: 'group-hover:border-slate-400/50',
    shadow: 'group-hover:shadow-slate-500/20',
  },
  employee: {
    bg: 'bg-[#0e888d]/10',
    text: 'text-[#0e888d]',
    iconHoverBg: 'group-hover:bg-[#0e888d]',
    dot: 'bg-[#0e888d]',
    border: 'group-hover:border-[#0e888d]/40',
    shadow: 'group-hover:shadow-[#0e888d]/20',
  },
  'eco-operator': {
    bg: 'bg-[#2D8B4E]/10',
    text: 'text-[#2D8B4E]',
    iconHoverBg: 'group-hover:bg-[#2D8B4E]',
    dot: 'bg-[#2D8B4E]',
    border: 'group-hover:border-[#2D8B4E]/40',
    shadow: 'group-hover:shadow-[#2D8B4E]/20',
  },
  business: {
    bg: 'bg-[#fea629]/10',
    text: 'text-[#fea629]',
    iconHoverBg: 'group-hover:bg-[#fea629]',
    dot: 'bg-[#fea629]',
    border: 'group-hover:border-[#fea629]/40',
    shadow: 'group-hover:shadow-[#fea629]/20',
  }
}

const handleRoleSelect = (_role: Role) => {
  // All roles go through the same login page
  router.push('/login/business')
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-[calc(100vh-300px)] py-10 lg:py-[60px] flex flex-col">
    <!-- Page header -->
    <div class="container-main">
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
          {{ $t('roleSelection.title') }}
        </h1>
      </div>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861] ml-14">
        {{ $t('roleSelection.subtitle') }}
      </p>
    </div>

    <!-- Role cards -->
    <div class="container-main pt-8 lg:pt-[60px]">
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-[30px]">
        <button
          v-for="role in roles"
          :key="role.id"
          @click="handleRoleSelect(role)"
          :class="[
            'group relative overflow-hidden bg-[#f1f5f9] rounded-[30px] p-6 lg:p-[40px]',
            'flex flex-col items-center text-center',
            'border border-transparent',
            'transition-all duration-300 ease-out',
            'hover:-translate-y-1 hover:shadow-xl',
            roleAccent[role.id].border,
            roleAccent[role.id].shadow
          ]"
        >
          <!-- Top-left role indicator dot -->
          <span
            aria-hidden="true"
            :class="[
              'absolute top-4 left-4 w-2 h-2 rounded-full',
              roleAccent[role.id].dot
            ]"
          />

          <!-- Icon circle -->
          <div
            :class="[
              'w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-full',
              'flex items-center justify-center mb-5 lg:mb-[30px]',
              'transition-colors duration-300',
              roleAccent[role.id].bg,
              roleAccent[role.id].iconHoverBg
            ]"
          >
            <!-- Settings (admin) - Lucide -->
            <svg
              v-if="role.icon === 'gear'"
              :class="[
                'w-10 h-10 lg:w-12 lg:h-12 transition-colors duration-300',
                'group-hover:text-white',
                roleAccent[role.id].text
              ]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <!-- ID-card (employee) - Lucide -->
            <svg
              v-if="role.icon === 'id-card'"
              :class="[
                'w-10 h-10 lg:w-12 lg:h-12 transition-colors duration-300',
                'group-hover:text-white',
                roleAccent[role.id].text
              ]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M16 10h2" />
              <path d="M16 14h2" />
              <circle cx="9" cy="11" r="2" />
              <path d="M5.5 17a3.5 3.5 0 0 1 7 0" />
            </svg>

            <!-- Recycle (eco-operator) - Lucide -->
            <svg
              v-if="role.icon === 'recycle'"
              :class="[
                'w-10 h-10 lg:w-12 lg:h-12 transition-colors duration-300',
                'group-hover:text-white',
                roleAccent[role.id].text
              ]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
              <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
              <path d="M14 16l-3 3 3 3" />
              <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
              <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
              <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
            </svg>

            <!-- Briefcase (business) - Lucide -->
            <svg
              v-if="role.icon === 'briefcase'"
              :class="[
                'w-10 h-10 lg:w-12 lg:h-12 transition-colors duration-300',
                'group-hover:text-white',
                roleAccent[role.id].text
              ]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              <rect x="2" y="6" width="20" height="14" rx="2" />
            </svg>
          </div>

          <!-- Role tag capsule -->
          <span
            :class="[
              'inline-flex items-center px-2.5 py-1 rounded-full',
              'text-[11px] font-semibold uppercase tracking-[0.08em]',
              'mb-3',
              roleAccent[role.id].bg,
              roleAccent[role.id].text,
            ]"
          >
            {{ role.tag }}
          </span>

          <!-- Title -->
          <h3 class="text-[#415861] text-xl lg:text-[24px] font-bold mb-2 lg:mb-[10px]">
            {{ role.title }}
          </h3>

          <!-- Description -->
          <p v-if="role.description" class="text-[#70868f] text-sm lg:text-[16px] font-medium">
            {{ role.description }}
          </p>

          <!-- CTA -->
          <div class="mt-4 lg:mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
            <span :class="roleAccent[role.id].text">{{ $t('roleSelection.enter') }}</span>
            <svg
              :class="[
                'w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1',
                roleAccent[role.id].text
              ]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Help text -->
    <div class="container-main pt-8 lg:pt-[40px]">
      <div class="text-center">
        <p class="text-[#70868f] text-sm lg:text-[16px]">
          {{ $t('roleSelection.noAccount') }}
          <router-link to="/register" class="text-[#0e888d] font-medium hover:underline">
            {{ $t('roleSelection.register') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
