<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SocialLinks from '@/components/ui/general/SocialLinks.vue'
import phoneIcon from '@/assets/images/icons/phone.svg';
import clockIcon from '@/assets/images/icons/clock.svg';
import mapPinIcon from '@/assets/images/icons/map-pin.svg';

const { t } = useI18n()

const footerNavItems = computed(() => [
  { label: t('nav.legislation'), path: '/legislation' },
  { label: t('nav.licenses'), path: '/licenses' },
  { label: t('nav.publications'), path: '/publications' },
  { label: t('nav.registries'), path: '/registries' },
  { label: t('nav.calculator'), path: '/calculator' },
  { label: t('nav.contests'), path: '/contests' },
  { label: t('nav.receptionPoints'), path: '/reception-points' },
])

const contactItems = computed(() => [
  {
    icon: phoneIcon,
    lines: [t('footer.contactPhone1'), t('footer.contactPhone2')],
  },
  {
    icon: clockIcon,
    lines: [t('footer.workHours'), t('footer.weekendClosed')],
  },
  {
    icon: mapPinIcon,
    lines: [t('footer.zip'), t('footer.street')],
  },
])

</script>

<template>
  <footer class="footer">
        <div class="footer-divider" />
    <!-- Top row: Logo + Nav -->
    <div class="container-main footer-top">
      <router-link to="/" class="footer-logo">
        <img src="@/assets/images/icons/logo.svg" alt="ЦРО" class="footer-logo-img" />
      </router-link>

      <nav class="footer-nav-links">
        <router-link
          v-for="item in footerNavItems"
          :key="item.path"
          :to="item.path"
          class="footer-nav-link"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>


    <!-- Bottom row: Contact + Social -->
    <div class="container-main footer-bottom">

        <div
          v-for="(item, i) in contactItems"
          :key="i"
          class="footer-contact-item"
        >
          <img
            :src="item.icon"
            alt=""
            class="footer-contact-icon"
          />
          <p class="footer-contact-text">
            {{ item.lines[0] }}<br />{{ item.lines[1] }}
          </p>
        </div>



        <SocialLinks />

    </div>
  </footer>
</template>

<style scoped>
.footer {
  @apply bg-white mt-20;
}

.footer-top {
  @apply flex items-center justify-between pt-[20px];
}

.footer-logo {
  @apply shrink-0;
}

.footer-logo-img {
  @apply h-[50px] w-auto;
}

.footer-nav-links {
  @apply flex items-center gap-10;
}

.footer-nav-link {
  @apply text-body-sm text-text-main uppercase hover:text-primary transition-colors;
}

.footer-divider {
  @apply w-full h-px bg-divider;
}

.footer-bottom {
  @apply flex items-center justify-between pt-[40px] pb-[40px] flex-wrap;
}

.footer-contact-item {
  @apply flex items-center gap-3;
}

.footer-contact-icon {
  @apply w-6 h-6 shrink-0;
}

.footer-contact-text {
  @apply text-caption-sm text-text-main;
}

@media (max-width:1280px){
 .footer-top {
    @apply flex-col items-start gap-5 pt-5;
  }

}

/* ── Tablet (≤1024px) ── */
@media (max-width: 1024px) {
  .footer {
    margin-top: 40px;
  }

  .footer-nav-links {
    @apply flex-row flex-wrap gap-x-6 gap-y-3;
  }

  .footer-nav-link {
    @apply text-caption;
  }

 .footer-bottom{
  gap:20px;
  justify-content: flex-start;
}

}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
  .footer {
    margin-top: 24px;
  }

  .footer-logo-img {
    @apply h-[40px];
  }

  .footer-nav-links {
    @apply gap-x-5 gap-y-2;
  }

  .footer-nav-link {
    @apply text-caption-sm;
  }
  
}
  @media (max-width: 480px) {
  .footer-bottom {
    @apply flex-col items-start gap-4 pt-7 pb-7;
    margin-top:20px;
  }
}


</style>
