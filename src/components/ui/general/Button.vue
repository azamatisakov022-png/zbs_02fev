<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'Button',
})

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'accent' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  tag?: 'button' | 'a' | 'router-link'
  to?: string
  href?: string
  padding?: string
}>(), {
  variant: 'primary',
  size: 'md',
  tag: 'button',
})

const customPaddingStyle = computed(() =>
  props.padding ? { padding: props.padding } : undefined
)
</script>

<template>
  <router-link
    v-if="tag === 'router-link'"
    :to="to ?? ''"
    class="app-btn"
    :class="[`app-btn--${variant}`, `app-btn--${size}`]"
    :style="customPaddingStyle"
  >
    <slot />
  </router-link>
  <a
    v-else-if="tag === 'a'"
    :href="href"
    class="app-btn"
    :class="[`app-btn--${variant}`, `app-btn--${size}`]"
    :style="customPaddingStyle"
  >
    <slot />
  </a>
  <button
    v-else
    class="app-btn"
    :class="[`app-btn--${variant}`, `app-btn--${size}`]"
    :style="customPaddingStyle"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
}

.app-btn:hover {
  opacity: 0.9;
}

/* ── Variants ── */
.app-btn--primary {
  background-color: var(--primary);
  color: var(--white);
}

.app-btn--accent {
  background-color: var(--secondary);
  color: var(--white);
}

.app-btn--outline {
  background-color: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.app-btn--outline:hover {
  background-color: var(--primary);
  color: var(--white);
  opacity: 1;
}

/* ── Size: xs (table actions) ── */
.app-btn--xs {
  font-size: var(--text-caption-sm);
  font-weight: var(--font-medium);
  padding: 8px 10px;
  border-radius: var(--radius-md);
  text-transform: none;
}

/* ── Size: sm (card actions) ── */
.app-btn--sm {
  font-size: var(--text-caption);
  font-weight: var(--font-medium);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  text-transform: none;
}

/* ── Size: md (standard actions — default) ── */
.app-btn--md {
  font-size: var(--text-caption);
  padding: 14px 20px;
  border-radius: var(--radius-pill);
}

/* ── Size: lg (hero / search actions) ── */
.app-btn--lg {
  font-size: var(--text-body-lg);
  padding: 16px 60px;
  border-radius: var(--radius-md);
}

/* ── Tablet (≤1024px) ── */
@media (max-width: 1024px) {
  .app-btn--xs {
    padding: 7px 10px;
  }

  .app-btn--sm {
    font-size: 13px;
    padding: 9px 16px;
  }

  .app-btn--md {
    font-size: 13px;
    padding: 12px 18px;
  }

  .app-btn--lg {
    font-size: var(--text-body-sm);
    padding: 14px 40px;
  }
}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
  .app-btn--xs {
    font-size: var(--text-caption-sm);
    padding: 8px 14px;
  }

  .app-btn--sm {
    font-size: 13px;
    padding: 8px 14px;
  }

  .app-btn--md {
    font-size: var(--text-caption-sm);
    padding: 10px 16px;
  }

  .app-btn--lg {
    font-size: var(--text-caption);
    padding: 12px 30px;
    border-radius: var(--radius-sm);
  }
}
</style>
