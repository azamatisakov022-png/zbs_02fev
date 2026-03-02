<script setup lang="ts">

const ctaButtons = [
  { label: 'Реестры участников', href: '/registries' },
  { label: 'Калькулятор сборов', href: '/calculator' },
  { label: 'Связаться с нами', href: '/contact' },
]

</script>

<template>
  <section class="cta-section">
    <div class="container-main">
      <div class="cta-banner">
        <h2 class="cta-title">
          Присоединяйтесь к устойчивому развитию
        </h2>
        <p class="cta-description">
          Вместе мы создаём чистое будущее для Кыргызстана.
          Узнайте больше о наших программах и возможностях участия.
        </p>

        <div class="cta-actions">
          <router-link
            v-for="button in ctaButtons"
            :key="button.href"
            :to="button.href"
            class="cta-btn"
          >
            {{ button.label }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>