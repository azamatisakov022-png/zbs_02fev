<script setup lang="ts">
import IconArrowRight from '../icons/IconArrowRight.vue'
</script>

<template>
  <section class="container-main py-4 lg:py-0 lg:pt-[30px]">
    <div class="relative h-[400px] md:h-[520px] lg:h-[640px] rounded-[30px] md:rounded-[40px] lg:rounded-[50px] overflow-hidden">
      <!-- Background image -->
      <img
        src="/images/hero-bg.jpg"
        alt="Eco background"
        class="absolute inset-0 w-full h-full object-cover"
      />

      <!-- Content wrapper -->
      <div class="relative h-full flex flex-col lg:flex-row">
        <!-- Left content -->
        <div class="flex-1 p-6 md:p-10 lg:p-[50px] flex flex-col">
          <!-- Badge -->
          <div class="inline-flex items-center bg-white/10 backdrop-blur-sm px-5 py-3.5 rounded-[25px] mb-6 lg:mb-0 w-fit">
            <span class="text-white text-sm md:text-base font-medium uppercase tracking-wide">
              🌱 Устойчивое развитие
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-white text-3xl md:text-4xl lg:text-[50px] lg:leading-[1.2] font-bold uppercase mt-6 lg:mt-[94px] mb-6 lg:mb-[77px]">
            О нас
          </h1>

          <!-- Description -->
          <div class="text-white text-sm md:text-base lg:text-[18px] lg:leading-[1.6] font-medium max-w-[506px] space-y-4">
            <p>
              Эко Оператор Кыргызстан — национальный оператор в сфере управления отходами, созданный для развития экологически устойчивой системы переработки и утилизации отходов на территории страны.
            </p>
            <p class="hidden md:block">
              Мы объединяем государственные органы, бизнес-сообщество, перерабатывающие предприятия и общественность с целью создания эффективной и прозрачной экосистемы обращения с отходами.
            </p>
            <p class="hidden lg:block">
              Наша деятельность направлена на внедрение современных стандартов переработки, поддержку экологической инфраструктуры и реализацию механизмов расширенной ответственности производителей. Мы стремимся обеспечить переход Кыргызстана к «зеленой экономике» и снизить негативное воздействие отходов на окружающую среду.
            </p>
          </div>

          <!-- Pagination dots -->
          <div class="flex items-center gap-[8px] mt-8 lg:mt-auto">
            <span class="w-[30px] h-[7px] bg-[#e3e3e3] rounded-[7px]"></span>
            <span class="w-[34px] h-[9px] bg-[#fea629] rounded-[7px]"></span>
            <span class="w-[30px] h-[7px] bg-[#e3e3e3] rounded-[7px]"></span>
          </div>
        </div>

        <!-- Right card - Desktop only positioned absolutely -->
        <div class="lg:absolute lg:right-[50px] lg:top-1/2 lg:-translate-y-1/2 p-6 md:p-10 lg:p-0">
          <div class="w-full lg:w-[285px] h-auto lg:h-[210px] bg-white/10 backdrop-blur-md rounded-[20px] shadow-[0px_25px_30px_0px_rgba(0,0,0,0.25)] relative">
            <!-- Top accent bar -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] lg:w-[161px] h-[5px] bg-[#fea629] rounded-b-[5px]"></div>

            <!-- Card inner content -->
            <div class="bg-[rgba(243,244,245,0.3)] m-[10px] rounded-[20px] h-[calc(100%-20px)] lg:h-[190px] p-6 lg:p-[30px] flex flex-col justify-center">
              <h3 class="text-white text-lg lg:text-[20px] lg:leading-[25px] font-black uppercase mb-4 lg:mb-[61px]">
                ЗАКЛЮЧИТЬ<br/>
                ДОГОВОР/ПОДАТЬ<br/>
                ОТЧЕТ
              </h3>

              <a href="#" class="inline-flex items-center gap-[10px] text-white text-xs font-black uppercase hover:text-[#fea629] transition-colors">
                Подробнее
                <IconArrowRight class="w-[21px] h-[9px]" />
              </a>
            </div>

            <!-- Bottom accent bar -->
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120px] lg:w-[161px] h-[5px] bg-[#0e888d] rounded-t-[5px]"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
