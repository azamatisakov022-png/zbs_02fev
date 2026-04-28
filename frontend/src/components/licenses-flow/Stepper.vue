<script setup lang="ts">
defineProps<{
  steps: string[]
  current: number // 1-based
}>()
defineEmits<{ (e: 'jump', i: number): void }>()
</script>

<template>
  <div class="stepper">
    <template v-for="(s, i) in steps" :key="i">
      <button
        type="button"
        class="stepper__item"
        :class="{
          'stepper__item--done': i + 1 < current,
          'stepper__item--active': i + 1 === current,
          'stepper__item--future': i + 1 > current,
        }"
        :disabled="i + 1 > current"
        @click="i + 1 < current && $emit('jump', i + 1)"
      >
        <span class="stepper__bubble">
          <svg v-if="i + 1 < current" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span v-else>{{ i + 1 }}</span>
        </span>
        <span class="stepper__label">{{ s }}</span>
      </button>
      <div
        v-if="i < steps.length - 1"
        class="stepper__bar"
        :class="{ 'stepper__bar--done': i + 1 < current }"
      />
    </template>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding: 2px 0;
}
.stepper__item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  background: transparent;
  border: none;
  font-family: inherit;
  cursor: default;
  min-width: 96px;
}
.stepper__item--done {
  cursor: pointer;
}
.stepper__bubble {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s ease;
}
.stepper__item--future .stepper__bubble {
  background: #fff;
  color: var(--lf-ink-4);
  border: 1.5px solid var(--lf-line);
}
.stepper__item--active .stepper__bubble {
  background: var(--lf-brand);
  color: #fff;
  box-shadow: 0 0 0 4px var(--lf-brand-050);
}
.stepper__item--done .stepper__bubble {
  background: var(--lf-brand);
  color: #fff;
}
.stepper__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--lf-ink-3);
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
}
.stepper__item--active .stepper__label {
  color: var(--lf-ink);
  font-weight: 600;
}
.stepper__item--done .stepper__label {
  color: var(--lf-ink-2);
}
.stepper__bar {
  flex: 1;
  height: 2px;
  background: var(--lf-line);
  border-radius: 1px;
  min-width: 24px;
  margin-bottom: 22px;
  transition: background 0.2s ease;
}
.stepper__bar--done {
  background: var(--lf-brand);
}

@media (max-width: 720px) {
  .stepper__label {
    display: none;
  }
  .stepper__item {
    min-width: 0;
  }
  .stepper__bar {
    margin-bottom: 0;
  }
}
</style>
