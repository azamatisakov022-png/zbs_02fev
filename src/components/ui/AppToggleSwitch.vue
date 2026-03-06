<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  activeColor?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue)
}

const trackStyle = computed(() => {
  if (props.modelValue && props.activeColor) {
    return { backgroundColor: props.activeColor }
  }
  return undefined
})
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="['app-toggle', { 'app-toggle--on': modelValue, 'app-toggle--disabled': disabled }]"
    :style="trackStyle"
    @click="toggle"
  >
    <span :class="['app-toggle__thumb', { 'app-toggle__thumb--on': modelValue }]" />
  </button>
</template>

<style scoped>
.app-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  background: #d1d5db;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.app-toggle--on {
  background: #0d9488;
}

.app-toggle--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.app-toggle__thumb--on {
  transform: translateX(20px);
}
</style>
