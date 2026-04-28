<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  required?: boolean
  error?: string
}>()
</script>

<template>
  <div class="field">
    <label class="field__label">
      {{ label }}
      <span v-if="required" class="field__required">*</span>
    </label>
    <div class="field__control">
      <slot />
    </div>
    <div v-if="error" class="field__error">{{ error }}</div>
    <div v-else-if="hint" class="field__hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--lf-ink-2);
}
.field__required {
  color: var(--lf-rose);
  margin-left: 2px;
}
.field__hint {
  font-size: 11.5px;
  color: var(--lf-ink-4);
}
.field__error {
  font-size: 11.5px;
  color: var(--lf-rose);
}
.field__control :deep(input),
.field__control :deep(textarea),
.field__control :deep(select) {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--lf-line);
  font-size: 13.5px;
  font-family: inherit;
  color: var(--lf-ink);
  background: #fff;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.field__control :deep(input:focus),
.field__control :deep(textarea:focus),
.field__control :deep(select:focus) {
  border-color: var(--lf-brand);
  box-shadow: 0 0 0 3px var(--lf-brand-050);
}
.field__control :deep(textarea) {
  resize: vertical;
  min-height: 72px;
}
</style>
