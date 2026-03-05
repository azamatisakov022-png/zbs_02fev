<script setup lang="ts">
defineOptions({
  name: 'Input',
})

const props = withDefaults(defineProps<{
  modelValue?: string | number
  type?: 'text' | 'number'
  placeholder?: string
  variant?: 'filled' | 'outlined'
  step?: string
}>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  variant: 'filled',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', props.type === 'number' ? target.valueAsNumber : target.value)
}
</script>

<template>
  <div
    class="app-input"
    :class="`app-input--${variant}`"
  >
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :step="step"
      class="app-input-field"
      @input="onInput"
    />
    <div v-if="$slots.suffix" class="app-input-suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>

<style scoped>
/* ── Shared ── */
.app-input {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.15s;
}

.app-input-field {
  width: 100%;
  background: transparent;
  outline: none;
  color: var(--text-main);
}

.app-input-field::placeholder {
  color: var(--text-main);
}

.app-input-suffix {
  flex-shrink: 0;
  margin-left: 8px;
}

/* ── Filled variant (calculator style) ── */
.app-input--filled {
  background: var(--bg-field);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  border: 1px solid transparent;
}

.app-input--filled:hover {
  border-color: var(--border-input);
}

.app-input--filled .app-input-field {
  font-size: var(--text-body-lg);
  font-weight: var(--font-regular);
}

/* ── Outlined variant (search style) ── */
.app-input--outlined {
  background: transparent;
  border: 1px solid var(--border-input);
  border-radius: var(--radius-pill);
  padding: 10px 20px;
}

.app-input--outlined:hover {
  border-color: var(--primary);
}

.app-input--outlined .app-input-field {
  font-size: var(--text-caption);
  font-weight: var(--font-regular);
  text-align: center;
}

/* ── Tablet (<=1024px) ── */
@media (max-width: 1024px) {
  .app-input--filled {
    padding: 12px 16px;
  }

  .app-input--filled .app-input-field {
    font-size: var(--text-body-sm);
  }

  .app-input--outlined .app-input-field {
    font-size: 13px;
  }
}

/* ── Mobile (<=768px) ── */
@media (max-width: 768px) {
  .app-input--filled {
    padding: 10px 14px;
    border-radius: var(--radius-sm);
  }

  .app-input--filled .app-input-field {
    font-size: var(--text-caption);
  }

  .app-input--outlined {
    border-radius: var(--radius-md);
    padding: 10px 16px;
  }

  .app-input--outlined .app-input-field {
    font-size: 13px;
    text-align: left;
  }
}
</style>
