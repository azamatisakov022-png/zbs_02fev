<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>()

const query = ref('')
const input = ref<HTMLInputElement | null>(null)

function add(value: string) {
  const v = value.trim()
  if (!v) return
  if (props.modelValue.some(x => x.toLowerCase() === v.toLowerCase())) {
    // Дубль — просто чистим инпут, не добавляя.
    query.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, v])
  query.value = ''
}

function remove(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    // Enter и запятая — добавляют чип.
    e.preventDefault()
    if (query.value.trim()) add(query.value)
  } else if (e.key === 'Backspace' && !query.value && props.modelValue.length) {
    // Backspace в пустом поле — удаляет последний чип.
    remove(props.modelValue.length - 1)
  }
}

function focus() {
  input.value?.focus()
}

function onBlur() {
  // На потере фокуса — добавляем pending-текст автоматически.
  // Распространённая UX-ошибка пользователей: ввели и забыли нажать Enter.
  if (query.value.trim()) add(query.value)
}
</script>

<template>
  <div class="picker" @click="focus">
    <span v-for="(v, i) in modelValue" :key="v" class="picker__chip">
      {{ v }}
      <button type="button" class="picker__chip-x" @click.stop="remove(i)" aria-label="Удалить">×</button>
    </span>
    <input
      ref="input"
      v-model="query"
      type="text"
      class="picker__input"
      :placeholder="modelValue.length === 0
        ? (placeholder || 'Введите вид деятельности и нажмите Enter')
        : 'Добавить ещё…'"
      @keydown="onKeydown"
      @blur="onBlur"
    />
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px;
  border: 1.5px solid var(--lf-line);
  border-radius: 10px;
  background: #fff;
  min-height: 48px;
  cursor: text;
  align-items: center;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.picker:hover {
  border-color: var(--lf-brand-100);
}
.picker:focus-within {
  border-color: var(--lf-brand);
  box-shadow: 0 0 0 3px var(--lf-brand-050);
}
.picker__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--lf-brand-050);
  color: var(--lf-brand-700);
  font-size: 12.5px;
  font-weight: 500;
  border: 1px solid var(--lf-brand-100);
}
.picker__chip-x {
  border: none;
  background: transparent;
  color: var(--lf-brand-700);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  opacity: 0.7;
}
.picker__chip-x:hover {
  opacity: 1;
}
.picker__input {
  flex: 1;
  min-width: 200px;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  background: transparent;
  padding: 4px 4px;
  color: var(--lf-ink);
}
.picker__input::placeholder {
  color: var(--lf-ink-4);
  opacity: 1;
}
</style>
