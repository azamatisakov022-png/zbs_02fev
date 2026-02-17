<script setup lang="ts">
const routerButtons = [
  { label: 'Реестры участников', href: '/registries' },
  { label: 'Калькулятор сборов', href: '/calculator' },
]

const scrollToContacts = () => {
  const el = document.getElementById('contacts')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  } else {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }
}
</script>

<template>
  <section class="py-8 md:py-12 lg:py-[100px]">
    <div class="container-main">
      <div class="bg-[#0e888d] rounded-[30px] md:rounded-[40px] lg:rounded-[50px] py-10 md:py-14 lg:py-[60px] px-6 md:px-12 lg:px-[151px] text-center">
        <h2 class="text-white text-xl md:text-3xl lg:text-[40px] lg:leading-[55px] font-bold uppercase mb-4 md:mb-6 lg:mb-[20px]">
          Присоединяйтесь к устойчивому развитию
        </h2>

        <p class="text-white text-sm md:text-lg lg:text-[30px] lg:leading-[41px] font-medium max-w-[1057px] mx-auto mb-8 md:mb-10 lg:mb-[40px]">
          Вместе мы создаём чистое будущее для Кыргызстана. Узнайте больше о наших программах и возможностях участия.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-[40px]">
          <router-link
            v-for="button in routerButtons"
            :key="button.label"
            :to="button.href"
            class="w-full sm:w-auto min-w-[200px] lg:min-w-[224px] bg-white/20 text-white px-6 lg:px-[30px] py-3.5 lg:py-[14px] rounded-[25px] text-sm lg:text-base font-semibold uppercase hover:bg-white/30 transition-colors"
          >
            {{ button.label }}
          </router-link>
          <button
            @click="scrollToContacts"
            class="w-full sm:w-auto min-w-[200px] lg:min-w-[224px] bg-white/20 text-white px-6 lg:px-[30px] py-3.5 lg:py-[14px] rounded-[25px] text-sm lg:text-base font-semibold uppercase hover:bg-white/30 transition-colors"
          >
            Связаться с нами
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
