<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  items: { label: string; icon?: string; danger?: boolean }[]
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
}>()

const open = ref(false)

const toggle = () => { open.value = !open.value }
const close = () => { open.value = false }
const select = (index: number) => {
  emit('select', index)
  close()
}
</script>

<template>
  <div class="app-action-menu">
    <button class="app-action-menu__trigger" @click.stop="toggle">&#x22EF;</button>
    <div v-if="open" class="app-action-menu__dropdown" @mouseleave="close">
      <button
        v-for="(item, i) in items"
        :key="i"
        :class="['app-action-menu__item', { 'app-action-menu__item--danger': item.danger }]"
        @click="select(i)"
      >
        <span v-if="item.icon" v-html="item.icon" />
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-action-menu {
  position: relative;
}

.app-action-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s;
}

.app-action-menu__trigger:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.app-action-menu__dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 10;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
  min-width: 170px;
  padding: 4px;
  overflow: hidden;
}

.app-action-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
  white-space: nowrap;
}

.app-action-menu__item:hover {
  background: #f3f4f6;
}

.app-action-menu__item--danger {
  color: #ef4444;
}

.app-action-menu__item--danger:hover {
  background: #fef2f2;
}
</style>
