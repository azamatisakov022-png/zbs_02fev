<script setup lang="ts">
const props = defineProps<{ modelValue: string; results: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
function clear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="search-bar">
    <span class="search-bar__icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    </span>
    <input
      type="text"
      :value="modelValue"
      @input="onInput"
      placeholder="Поиск по номеру лицензии, ИНН или наименованию…"
    />
    <button v-if="modelValue" class="search-bar__clear" @click="clear">
      {{ results }} · Очистить
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
}
.search-bar__icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--lr-ink-4);
  display: inline-flex;
}
.search-bar input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border-radius: 12px;
  border: 1px solid var(--lr-line);
  background: #fff;
  font-size: 15px;
  font-family: inherit;
  color: var(--lr-ink);
  outline: none;
  box-shadow: 0 1px 2px rgba(12, 23, 19, 0.03);
}
.search-bar input:focus {
  border-color: var(--lr-brand);
  box-shadow: 0 0 0 3px rgba(14, 140, 90, 0.12);
}
.search-bar__clear {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: var(--lr-line-2);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--lr-ink-3);
  cursor: pointer;
  font-family: inherit;
}
</style>
