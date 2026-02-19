<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  description: string
  actions: string[]
  icon?: string
  storageKey: string
}>(), {
  icon: 'info',
})

const isHidden = ref(false)

const useGrid = computed(() => props.actions.length > 4)

onMounted(() => {
  isHidden.value = localStorage.getItem(`guide_${props.storageKey}`) === 'hidden'
})

function hide() {
  isHidden.value = true
  localStorage.setItem(`guide_${props.storageKey}`, 'hidden')
}

function show() {
  isHidden.value = false
  localStorage.removeItem(`guide_${props.storageKey}`)
}
</script>

<template>
  <!-- Restore button -->
  <div v-if="isHidden" class="sg-restore-wrap">
    <button class="sg-restore" @click="show" title="Показать подсказку">
      <span class="sg-restore-icon">💡</span>
    </button>
  </div>

  <!-- Guide banner -->
  <div v-else class="sg-banner">
    <button class="sg-close" @click="hide">✕ Скрыть подсказку</button>

    <div class="sg-body">
      <div class="sg-icon">
        <span v-if="icon === 'info'">ℹ️</span>
        <span v-else>💡</span>
      </div>

      <div class="sg-content">
        <div class="sg-title">{{ title }}</div>
        <div class="sg-desc">{{ description }}</div>

        <div class="sg-actions" :class="{ 'sg-actions--grid': useGrid }">
          <div v-for="(action, i) in actions" :key="i" class="sg-action">
            <span class="sg-check">✓</span> {{ action }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sg-banner {
  position: relative;
  background: #ecfdf5;
  border-left: 4px solid #10b981;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.sg-close {
  position: absolute;
  top: 10px;
  right: 14px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.15s;
}
.sg-close:hover {
  color: #64748b;
}

.sg-body {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.sg-icon {
  font-size: 22px;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 1px;
}

.sg-content {
  flex: 1;
  min-width: 0;
  padding-right: 100px;
}

.sg-title {
  font-weight: 600;
  font-size: 15px;
  color: #065f46;
  margin-bottom: 2px;
}

.sg-desc {
  font-size: 13px;
  color: #047857;
  margin-bottom: 8px;
  line-height: 1.45;
}

.sg-actions {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sg-actions--grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px 24px;
}
@media (max-width: 640px) {
  .sg-actions--grid {
    grid-template-columns: 1fr;
  }
}

.sg-action {
  font-size: 13px;
  color: #065f46;
  line-height: 1.5;
}

.sg-check {
  color: #10b981;
  font-weight: 700;
  margin-right: 4px;
}

.sg-restore-wrap {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.sg-restore {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: background 0.15s;
}
.sg-restore:hover {
  background: #ecfdf5;
  border-color: #10b981;
}

.sg-restore-icon {
  display: inline-block;
}
</style>
