<script setup lang="ts">
import { ref } from 'vue'

interface FAQItem {
  id: number
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Кто должен оплачивать утилизационный сбор?',
    answer:
      'Утилизационный сбор обязаны уплачивать производители и импортёры товаров, подлежащих утилизации после утраты потребительских свойств, включая упаковку. Это касается юридических лиц и индивидуальных предпринимателей, осуществляющих производство или ввоз на территорию Кыргызской Республики товаров, перечень которых утверждён Правительством КР.',
  },
  {
    id: 2,
    question: 'Как рассчитывается размер утилизационного сбора?',
    answer:
      'Размер утилизационного сбора рассчитывается путём умножения массы товара (в тоннах) на ставку утилизационного сбора, установленную для соответствующей группы товаров, с учётом нормативов утилизации. Ставки устанавливаются Правительством КР и могут различаться в зависимости от вида и категории товара.',
  },
  {
    id: 3,
    question: 'Какие товарные группы подлежат утилизационному сбору?',
    answer:
      'Утилизационному сбору подлежат товары из 10 основных групп: бумага и картон, пластмассовая упаковка, стеклянная тара, металлическая упаковка, шины и покрышки, электронное оборудование, аккумуляторы и батареи, масла и смазочные материалы, текстильная продукция и прочие товары согласно перечню.',
  },
  {
    id: 4,
    question: 'Как подать отчёт о переработке?',
    answer:
      'Отчёт о переработке подаётся через личный кабинет системы «Цифровой реестр отходов». Необходимо авторизоваться, выбрать раздел «Отчёты о переработке» и заполнить форму, указав объёмы переработанных отходов по каждой товарной группе за отчётный период.',
  },
  {
    id: 5,
    question: 'Куда направляются средства утилизационного сбора?',
    answer:
      'Собранные средства утилизационного сбора направляются на финансирование системы сбора, сортировки и переработки отходов, развитие инфраструктуры обращения с отходами, а также на стимулирование деятельности переработчиков отходов на территории Кыргызской Республики.',
  },
  {
    id: 6,
    question: 'Что такое Расширенная ответственность производителя (РОП)?',
    answer:
      'РОП — это принцип экологической политики, согласно которому ответственность производителя за товар распространяется на весь жизненный цикл продукции, включая стадию после потребления. Производители и импортёры обязаны обеспечить утилизацию отходов от использования своих товаров или уплатить утилизационный сбор.',
  },
]

const openId = ref<number | null>(null)

function toggle(id: number) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <section style="background: linear-gradient(180deg, white 0%, #F0FDF4 100%)">
    <div class="container-main py-20">
      <!-- Section header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-[#111827] tracking-tight mb-2">
          Часто задаваемые вопросы
        </h2>
        <p class="text-[#6B7280]">
          Ответы на основные вопросы об утилизационном сборе и системе обращения с отходами
        </p>
      </div>

      <!-- FAQ items -->
      <div class="max-w-3xl mx-auto space-y-3">
        <div
          v-for="item in faqItems"
          :key="item.id"
          class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
        >
          <!-- Question header -->
          <button
            class="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
            @click="toggle(item.id)"
          >
            <span class="font-semibold text-[#111827] pr-4">{{ item.question }}</span>
            <svg
              class="w-5 h-5 text-[#6B7280] flex-shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': openId === item.id }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Answer content -->
          <div
            class="faq-answer overflow-hidden transition-all duration-300"
            :style="{
              maxHeight: openId === item.id ? '500px' : '0px',
              opacity: openId === item.id ? 1 : 0,
            }"
          >
            <div class="px-6 pb-5 text-[#6B7280] leading-relaxed text-sm">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
