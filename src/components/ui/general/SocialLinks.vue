<script setup lang="ts">
defineOptions({
  name: 'SocialLinks',
})

withDefaults(defineProps<{
  showLabels?: boolean
  direction?: 'row' | 'column'
}>(), {
  showLabels: true,
  direction: 'row',
})

const socialLinks = [
  { id: 'instagram', href: 'https://instagram.com/reestr_kg', name: 'Instagram', handle: 'reestr_kg', color: '#E4405F', bg: 'rgba(228,64,95,0.1)' },
  { id: 'telegram', href: 'https://t.me/reestr_kg', name: 'Telegram', handle: 'reestr_kg', color: '#26A5E4', bg: 'rgba(38,165,228,0.1)' },
  { id: 'facebook', href: 'https://facebook.com/reestr_kg', name: 'Facebook', handle: '@reestr_kg', color: '#1877F2', bg: 'rgba(24,119,242,0.1)' },
  { id: 'youtube', href: 'https://youtube.com/@reestr_kg', name: 'YouTube', handle: '@reestr_kg', color: '#FF0000', bg: 'rgba(255,0,0,0.1)' },
  { id: 'linkedin', href: 'https://linkedin.com/company/reestr_kg', name: 'Linkedin', handle: '@reestr_kg', color: '#0A66C2', bg: 'rgba(10,102,194,0.1)' },
]
</script>

<template>
  <div
    class="social-links"
    :class="`social-links--${direction}`"
  >
    <a
      v-for="social in socialLinks"
      :key="social.id"
      :href="social.href"
      target="_blank"
      rel="noopener noreferrer"
      class="social-link"
      :style="{ '--brand-color': social.color, '--brand-bg': social.bg } as any"
    >
      <span class="social-icon-wrap">
        <!-- Instagram -->
        <svg v-if="social.id === 'instagram'" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 8.75C11.138 8.75 10.3114 9.09241 9.7019 9.7019C9.09241 10.3114 8.75 11.138 8.75 12C8.75 12.862 9.09241 13.6886 9.7019 14.2981C10.3114 14.9076 11.138 15.25 12 15.25C12.862 15.25 13.6886 14.9076 14.2981 14.2981C14.9076 13.6886 15.25 12.862 15.25 12C15.25 11.138 14.9076 10.3114 14.2981 9.7019C13.6886 9.09241 12.862 8.75 12 8.75Z" fill="currentColor"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M6.77 3.082C10.246 2.69693 13.754 2.69693 17.23 3.082C19.129 3.294 20.66 4.789 20.883 6.695C21.2949 10.2197 21.2949 13.7803 20.883 17.305C20.66 19.211 19.129 20.706 17.231 20.919C13.7546 21.3041 10.2464 21.3041 6.77 20.919C4.871 20.706 3.34 19.211 3.117 17.306C2.70498 13.781 2.70498 10.22 3.117 6.695C3.34 4.789 4.871 3.294 6.77 3.082ZM17 6C16.7348 6 16.4804 6.10536 16.2929 6.29289C16.1054 6.48043 16 6.73478 16 7C16 7.26522 16.1054 7.51957 16.2929 7.70711C16.4804 7.89464 16.7348 8 17 8C17.2652 8 17.5196 7.89464 17.7071 7.70711C17.8946 7.51957 18 7.26522 18 7C18 6.73478 17.8946 6.48043 17.7071 6.29289C17.5196 6.10536 17.2652 6 17 6ZM7.25 12C7.25 10.7402 7.75045 9.53204 8.64124 8.64124C9.53204 7.75045 10.7402 7.25 12 7.25C13.2598 7.25 14.468 7.75045 15.3588 8.64124C16.2496 9.53204 16.75 10.7402 16.75 12C16.75 13.2598 16.2496 14.468 15.3588 15.3588C14.468 16.2496 13.2598 16.75 12 16.75C10.7402 16.75 9.53204 16.2496 8.64124 15.3588C7.75045 14.468 7.25 13.2598 7.25 12Z" fill="currentColor"/>
        </svg>
        <!-- Telegram -->
        <svg v-else-if="social.id === 'telegram'" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.12 13.35 8.76 13.49 8.44 13.48C8.08 13.47 7.4 13.28 6.89 13.11C6.26 12.91 5.77 12.8 5.81 12.45C5.83 12.27 6.08 12.09 6.55 11.9C9.47 10.63 11.41 9.79 12.38 9.39C15.16 8.23 15.73 8.03 16.11 8.03C16.19 8.03 16.38 8.05 16.5 8.15C16.6 8.23 16.63 8.34 16.64 8.42C16.63 8.48 16.65 8.66 16.64 8.8Z" fill="currentColor"/>
        </svg>
        <!-- Facebook -->
        <svg v-else-if="social.id === 'facebook'" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16V15H13V21.95C18.05 21.45 22 17.19 22 12Z" fill="currentColor"/>
        </svg>
        <!-- YouTube -->
        <svg v-else-if="social.id === 'youtube'" width="24" height="24" viewBox="0 0 20 19.814" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C10.855 0 11.732 0.0220001 12.582 0.0580001L13.586 0.106L14.547 0.163L15.447 0.224L16.269 0.288C17.1612 0.355891 18.0008 0.736434 18.64 1.3626C19.2791 1.98877 19.6768 2.8204 19.763 3.711L19.803 4.136L19.878 5.046C19.948 5.989 20 7.017 20 8C20 8.983 19.948 10.011 19.878 10.954L19.803 11.864L19.763 12.289C19.6768 13.1798 19.2789 14.0115 18.6396 14.6377C18.0002 15.2639 17.1604 15.6443 16.268 15.712L15.448 15.775L14.548 15.837L13.586 15.894L12.582 15.942C11.7218 15.9793 10.861 15.9986 10 16C9.13902 15.9986 8.27817 15.9793 7.418 15.942L6.414 15.894L5.453 15.837L4.553 15.775L3.731 15.712C2.83881 15.6441 1.9992 15.2636 1.36004 14.6374C0.720888 14.0112 0.323191 13.1796 0.237 12.289L0.197 11.864L0.122 10.954C0.0458327 9.97112 0.00513964 8.98581 0 8C0 7.017 0.052 5.989 0.122 5.046L0.197 4.136L0.237 3.711C0.323157 2.82055 0.720712 1.98905 1.35966 1.36291C1.99861 0.736759 2.83799 0.356116 3.73 0.288L4.551 0.224L5.451 0.163L6.413 0.106L7.417 0.0580001C8.2775 0.0207272 9.13869 0.00138958 10 0ZM8 5.575V10.425C8 10.887 8.5 11.175 8.9 10.945L13.1 8.52C13.1914 8.46739 13.2673 8.39162 13.3201 8.30033C13.3729 8.20904 13.4007 8.10545 13.4007 8C13.4007 7.89455 13.3729 7.79096 13.3201 7.69967C13.2673 7.60838 13.1914 7.53261 13.1 7.48L8.9 5.056C8.80876 5.00332 8.70526 4.9756 8.5999 4.97562C8.49455 4.97563 8.39106 5.00339 8.29983 5.0561C8.20861 5.1088 8.13287 5.1846 8.08024 5.27587C8.02761 5.36713 7.99993 5.47065 8 5.576V5.575Z" fill="currentColor"/>
        </svg>
        <!-- LinkedIn -->
        <svg v-else-if="social.id === 'linkedin'" width="24" height="24" viewBox="0 0 18 20.814" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M15 0C15.7956 0 16.5587 0.316071 17.1213 0.87868C17.6839 1.44129 18 2.20435 18 3V15C18 15.7956 17.6839 16.5587 17.1213 17.1213C16.5587 17.6839 15.7956 18 15 18H3C2.20435 18 1.44129 17.6839 0.87868 17.1213C0.316071 16.5587 0 15.7956 0 15V3C0 2.20435 0.316071 1.44129 0.87868 0.87868C1.44129 0.316071 2.20435 0 3 0H15ZM5 7C4.73478 7 4.48043 7.10536 4.29289 7.29289C4.10536 7.48043 4 7.73478 4 8V13C4 13.2652 4.10536 13.5196 4.29289 13.7071C4.48043 13.8946 4.73478 14 5 14C5.26522 14 5.51957 13.8946 5.70711 13.7071C5.89464 13.5196 6 13.2652 6 13V8C6 7.73478 5.89464 7.48043 5.70711 7.29289C5.51957 7.10536 5.26522 7 5 7ZM8 6C7.73478 6 7.48043 6.10536 7.29289 6.29289C7.10536 6.48043 7 6.73478 7 7V13C7 13.2652 7.10536 13.5196 7.29289 13.7071C7.48043 13.8946 7.73478 14 8 14C8.26522 14 8.51957 13.8946 8.70711 13.7071C8.89464 13.5196 9 13.2652 9 13V9.34C9.305 8.996 9.82 8.592 10.393 8.347C10.726 8.205 11.227 8.147 11.575 8.257C11.6904 8.28629 11.7933 8.35226 11.868 8.445C11.92 8.515 12 8.671 12 9V13C12 13.2652 12.1054 13.5196 12.2929 13.7071C12.4804 13.8946 12.7348 14 13 14C13.2652 14 13.5196 13.8946 13.7071 13.7071C13.8946 13.5196 14 13.2652 14 13V9C14 8.33 13.83 7.734 13.476 7.256C13.1503 6.82256 12.6944 6.50472 12.175 6.349C11.273 6.066 10.274 6.223 9.607 6.509C9.39347 6.60084 9.18545 6.70502 8.984 6.821C8.94208 6.59059 8.82062 6.3822 8.6408 6.23216C8.46097 6.08213 8.23419 5.99996 8 6ZM5 4C4.73478 4 4.48043 4.10536 4.29289 4.29289C4.10536 4.48043 4 4.73478 4 5C4 5.26522 4.10536 5.51957 4.29289 5.70711C4.48043 5.89464 4.73478 6 5 6C5.26522 6 5.51957 5.89464 5.70711 5.70711C5.89464 5.51957 6 5.26522 6 5C6 4.73478 5.89464 4.48043 5.70711 4.29289C5.51957 4.10536 5.26522 4 5 4Z" fill="currentColor"/>
        </svg>
      </span>
      <p v-if="showLabels" class="social-text">
        {{ social.name }}<br />{{ social.handle }}
      </p>
    </a>
  </div>
</template>

<style scoped>
.social-links {
  display: flex;
  align-items: center;
}

.social-links--row {
  flex-direction: row;
  gap: 50px;
}

.social-links--column {
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-main);
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: var(--brand-color);
}

.social-icon-wrap {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  background: transparent;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.social-icon-wrap svg {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.social-link:hover .social-icon-wrap {
  background: var(--brand-bg);
  transform: translateY(-2px);
}

.social-link:hover .social-icon-wrap svg {
  transform: scale(1.1);
}

.social-text {
  font-size: var(--text-caption-sm);
  transition: color 0.3s ease;
}

/* ── Tablet (<=1024px) ── */
@media (max-width: 1024px) {
  .social-links--row {
    flex-wrap: wrap;
    gap: 20px;
  }

  .social-text {
    display: none;
  }
}

/* ── Mobile (<=768px) ── */
@media (max-width: 768px) {
  .social-links--row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .social-text {
    display: block;
  }
}
</style>
