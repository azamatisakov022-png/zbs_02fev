<script setup lang="ts">
interface Document {
  id: number
  title: string
  description: string
}

const documents: Document[] = [
  {
    id: 1,
    title: 'Постановление №322',
    description: 'О порядке взимания утилизационного сбора и ставках утилизационного сбора',
  },
  {
    id: 2,
    title: 'Постановление №730',
    description: 'Об утверждении нормативов утилизации отходов от использования товаров',
  },
  {
    id: 3,
    title: 'Постановление №563',
    description: 'О расширенной ответственности производителей и импортёров',
  },
  {
    id: 4,
    title: 'Постановление №561',
    description: 'Порядок создания и ведения реестра переработчиков отходов',
  },
]
</script>

<template>
  <section class="bg-white">
    <div class="container-main py-20">
      <!-- Section header -->
      <div class="mb-10">
        <h2 class="text-3xl font-bold text-[#111827] tracking-tight mb-2">
          Нормативные документы
        </h2>
        <p class="text-[#6B7280]">
          Ключевые постановления, регулирующие сферу обращения с отходами и утилизационного сбора
        </p>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="dash-card dash-card-hover p-6 flex flex-col"
        >
          <!-- Document icon -->
          <div class="mb-4">
            <svg
              class="w-10 h-10 text-[#0e888d]"
              fill="none"
              viewBox="0 0 40 40"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="8" y="4" width="24" height="32" rx="2" />
              <line x1="13" y1="14" x2="27" y2="14" />
              <line x1="13" y1="20" x2="27" y2="20" />
              <line x1="13" y1="26" x2="21" y2="26" />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="font-bold text-[#111827] text-base mb-2">
            {{ doc.title }}
          </h3>

          <!-- Description -->
          <p class="text-[#6B7280] text-sm leading-relaxed mb-4 flex-1">
            {{ doc.description }}
          </p>

          <!-- Link -->
          <a
            href="#"
            class="text-[#0e888d] text-sm font-semibold hover:opacity-80 transition-opacity mt-auto"
          >
            Подробнее &rarr;
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
