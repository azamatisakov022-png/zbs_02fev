<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  description: string
  actions: string[]
  /** Устаревший - оставлен для обратной совместимости с вызовами из страниц. Не используется. */
  icon?: string
  /** Ключ для localStorage - запоминает раскрытое/свёрнутое состояние per-страница. */
  storageKey: string
}>(), {
  icon: 'info',
})

const isExpanded = ref(false)

onMounted(() => {
  // По умолчанию свёрнуто. Если пользователь явно развернул раньше - запомнили.
  isExpanded.value = localStorage.getItem(`guide_${props.storageKey}`) === 'expanded'
})

function toggle() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    localStorage.setItem(`guide_${props.storageKey}`, 'expanded')
  } else {
    localStorage.removeItem(`guide_${props.storageKey}`)
  }
}
</script>

<template>
  <div class="sg" :class="{ 'sg--expanded': isExpanded }">
    <!-- Триггер (всегда виден) -->
    <button class="sg-trigger" @click="toggle" :aria-expanded="isExpanded">
      <svg class="sg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span class="sg-trigger-text">{{ title }}</span>
      <svg class="sg-chevron" :class="{ 'sg-chevron--open': isExpanded }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- Развёрнутое содержимое -->
    <div v-if="isExpanded" class="sg-body">
      <p class="sg-desc">{{ description }}</p>
      <ul class="sg-actions">
        <li v-for="(action, i) in actions" :key="i" class="sg-action">
          <span class="sg-bullet" aria-hidden="true">-</span>
          <span>{{ action }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.sg {
  border: 1px solid #e2e8f0;            /* slate-200 */
  border-radius: 8px;
  background: #f8fafc;                   /* slate-50 */
  margin-bottom: 16px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.sg:hover {
  border-color: #cbd5e1;                 /* slate-300 */
}

.sg--expanded {
  background: #ffffff;
}

/* Trigger (свёрнутое состояние - минимальная строка) */
.sg-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  color: #475569;                        /* slate-600 */
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  transition: color 0.15s;
}

.sg-trigger:hover {
  color: #1e293b;                        /* slate-800 */
}

.sg-icon {
  color: #64748b;                        /* slate-500 */
  flex-shrink: 0;
}

.sg-trigger-text {
  flex: 1;
  min-width: 0;
}

.sg-chevron {
  color: #94a3b8;                        /* slate-400 */
  transition: transform 0.2s;
  flex-shrink: 0;
}

.sg-chevron--open {
  transform: rotate(180deg);
}

/* Body (развёрнутое) */
.sg-body {
  padding: 2px 14px 14px 38px;
  border-top: 1px solid #e2e8f0;
  margin-top: 0;
  padding-top: 12px;
}

.sg-desc {
  font-size: 13px;
  color: #475569;                        /* slate-600 */
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.sg-actions {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sg-action {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #475569;                        /* slate-600 */
  line-height: 1.5;
}

.sg-bullet {
  color: #94a3b8;                        /* slate-400 */
  flex-shrink: 0;
  user-select: none;
}
</style>
