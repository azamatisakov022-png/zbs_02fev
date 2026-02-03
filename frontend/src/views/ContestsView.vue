<script setup lang="ts">
const handleApply = () => {
  // TODO: Implement application logic
}
</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <!-- Page header -->
    <div class="container-main">
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[12px]">
        Конкурсы и гранты
      </h1>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861]">
        Программы поддержки экологических проектов
      </p>
    </div>

    <!-- Main content -->
    <div class="container-main pt-8 lg:pt-[60px]">
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-[92px]">
        <!-- Left side - Image -->
        <div class="w-full lg:w-[675px] flex-shrink-0">
          <div class="relative rounded-[30px] lg:rounded-[50px] overflow-hidden aspect-[675/480]">
            <img
              src="/images/contests-hero.jpg"
              alt="Экологический проект"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Right side - Content -->
        <div class="flex flex-col justify-between lg:min-h-[480px]">
          <!-- Top section - Open applications -->
          <div class="mb-8 lg:mb-0">
            <h2 class="text-xl md:text-2xl lg:text-[30px] font-bold text-[#415861] uppercase mb-4 lg:mb-[20px]">
              <span class="mr-2">🏆</span>Открыт приём заявок!
            </h2>
            <div class="text-[#415861] text-base lg:text-[18px] font-medium leading-relaxed">
              <p>Конкурс экологических проектов 2024</p>
              <p>Срок подачи заявок: до 31 декабря 2024 года</p>
              <p>Размер гранта: до 500 000 сом</p>
            </div>
          </div>

          <!-- Middle section - Conditions -->
          <div class="mb-8 lg:mb-0">
            <h2 class="text-xl md:text-2xl lg:text-[30px] font-bold text-[#415861] uppercase mb-4 lg:mb-[20px]">
              Условия участия
            </h2>
            <ul class="text-[#415861] text-base lg:text-[18px] font-medium leading-relaxed list-disc pl-7 space-y-1">
              <li>Юридические лица, зарегистрированные в КР</li>
              <li>Проект направлен на переработку или утилизацию отходов</li>
              <li>Срок реализации — до 12 месяцев</li>
            </ul>
          </div>

          <!-- Button -->
          <button
            @click="handleApply"
            class="w-full bg-[#0e888d] text-white text-xl lg:text-[24px] font-medium py-5 lg:py-[28px] rounded-[30px] hover:bg-[#0a6d71] transition-colors"
          >
            Подать заявку
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
