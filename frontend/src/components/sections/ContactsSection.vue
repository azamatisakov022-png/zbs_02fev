<script setup lang="ts">
const contactInfo = {
  organization:
    'Министерство природных ресурсов, экологии и технического надзора Кыргызской Республики (МПРЭТН КР)',
  address: '720040, г. Бишкек, бул. Эркиндик, 2',
  phone: '+996 (312) 62-32-28',
  email: 'info@ecology.gov.kg',
}
</script>

<template>
  <section class="bg-[#111827]">
    <div class="container-main py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <!-- Left column: contact info -->
        <div>
          <h2 class="text-3xl font-bold text-white tracking-tight mb-6">
            Контакты
          </h2>

          <p class="text-[#9CA3AF] text-sm leading-relaxed mb-8">
            {{ contactInfo.organization }}
          </p>

          <div class="space-y-5">
            <!-- Address -->
            <div class="flex items-start gap-3">
              <svg
                class="w-5 h-5 text-[#0e888d] mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="text-white text-sm">{{ contactInfo.address }}</span>
            </div>

            <!-- Phone -->
            <div class="flex items-start gap-3">
              <svg
                class="w-5 h-5 text-[#0e888d] mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a
                :href="'tel:' + contactInfo.phone.replace(/[^+\d]/g, '')"
                class="text-white text-sm hover:text-[#0e888d] transition-colors"
              >
                {{ contactInfo.phone }}
              </a>
            </div>

            <!-- Email -->
            <div class="flex items-start gap-3">
              <svg
                class="w-5 h-5 text-[#0e888d] mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                :href="'mailto:' + contactInfo.email"
                class="text-white text-sm hover:text-[#0e888d] transition-colors"
              >
                {{ contactInfo.email }}
              </a>
            </div>
          </div>
        </div>

        <!-- Right column: additional info / map placeholder -->
        <div class="flex flex-col justify-center">
          <div class="bg-[#1F2937] rounded-2xl p-8">
            <h3 class="text-white font-semibold text-lg mb-4">
              Режим работы
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-[#9CA3AF]">Понедельник - Пятница</span>
                <span class="text-white">09:00 - 18:00</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#9CA3AF]">Суббота</span>
                <span class="text-white">Выходной</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#9CA3AF]">Воскресенье</span>
                <span class="text-white">Выходной</span>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-[#374151]">
              <h3 class="text-white font-semibold text-lg mb-3">
                Приёмная
              </h3>
              <p class="text-[#9CA3AF] text-sm leading-relaxed">
                Для записи на приём и получения консультации обращайтесь по указанному телефону или электронной почте в рабочее время.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
