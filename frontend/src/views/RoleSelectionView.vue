<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface Role {
  id: string
  title: string
  description: string
  icon: string
}

const roles: Role[] = [
  {
    id: 'admin',
    title: 'Администратор',
    description: 'Управление системой',
    icon: 'gear'
  },
  {
    id: 'employee',
    title: 'Сотрудник МПРЭТН КР',
    description: 'Министерство природных ресурсов, экологии и технического надзора',
    icon: 'id-card'
  },
  {
    id: 'eco-operator',
    title: 'ГП «Эко Оператор»',
    description: '',
    icon: 'recycle'
  },
  {
    id: 'business',
    title: 'Плательщик',
    description: 'Импортёры, производители товаров и упаковки',
    icon: 'briefcase'
  }
]

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
          Вход в систему
        </h1>
      </div>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861] ml-14">
        Выберите вашу роль для входа в личный кабинет
      </p>
    </div>

    <!-- Role cards -->
    <div class="container-main pt-8 lg:pt-[60px] flex-1 flex items-center">
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-[30px]">
        <button
          v-for="role in roles"
          :key="role.id"
          @click="handleRoleSelect(role)"
          class="group bg-[#f8fafc] hover:bg-[#e8f5f5] rounded-[30px] p-6 lg:p-[40px] flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <!-- Icon -->
          <div class="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-full bg-[#e8f5f5] group-hover:bg-[#0e888d] flex items-center justify-center mb-5 lg:mb-[30px] transition-colors duration-300">
            <!-- Gear icon for Admin -->
            <svg
              v-if="role.icon === 'gear'"
              class="w-10 h-10 lg:w-12 lg:h-12 text-[#0e888d] group-hover:text-white transition-colors duration-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>

            <!-- Briefcase icon for Business -->
            <svg
              v-if="role.icon === 'briefcase'"
              class="w-10 h-10 lg:w-12 lg:h-12 text-[#0e888d] group-hover:text-white transition-colors duration-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm10 14H4v-7h4v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h4v7zm-4-8v-1H8v1H4V9h16v2h-4z"/>
            </svg>

            <!-- ID Card icon for Employee -->
            <svg
              v-if="role.icon === 'id-card'"
              class="w-10 h-10 lg:w-12 lg:h-12 text-[#0e888d] group-hover:text-white transition-colors duration-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10-4h2v6h-2v-6zm-4-2h6v2h-6V8zM6 8h4v2H6V8z"/>
              <circle cx="9" cy="11" r="2"/>
              <path d="M9 13c-1.66 0-3 .67-3 1.5V15h6v-.5c0-.83-1.34-1.5-3-1.5z"/>
            </svg>

            <!-- Recycle icon for Eco Operator -->
            <svg
              v-if="role.icon === 'recycle'"
              class="w-10 h-10 lg:w-12 lg:h-12 text-[#0e888d] group-hover:text-white transition-colors duration-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>

          <!-- Title -->
          <h3 class="text-[#415861] text-xl lg:text-[24px] font-bold mb-2 lg:mb-[10px]">
            {{ role.title }}
          </h3>

          <!-- Description -->
          <p v-if="role.description" class="text-[#70868f] text-sm lg:text-[16px] font-medium">
            {{ role.description }}
          </p>
        </button>
      </div>
    </div>

    <!-- Help text -->
    <div class="container-main pt-8 lg:pt-[40px]">
      <div class="text-center">
        <p class="text-[#70868f] text-sm lg:text-[16px]">
          Нет аккаунта?
          <router-link to="/register" class="text-[#0e888d] font-medium hover:underline">
            Зарегистрироваться
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
