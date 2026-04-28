<script setup lang="ts">
export interface TimelineEvent {
  at: string // 'YYYY-MM-DD HH:mm' or 'ожидается'
  title: string
  desc?: string
  icon: 'check' | 'bolt' | 'user' | 'pin' | 'stamp' | 'x'
  done: boolean
}

defineProps<{ events: TimelineEvent[] }>()
</script>

<template>
  <div class="tl">
    <div
      v-for="(e, i) in events"
      :key="i"
      class="tl__row"
      :class="{ 'tl__row--last': i === events.length - 1 }"
    >
      <div class="tl__icon" :class="{ 'tl__icon--done': e.done }">
        <svg v-if="e.icon === 'check'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else-if="e.icon === 'bolt'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else-if="e.icon === 'user'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <svg v-else-if="e.icon === 'pin'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 21s-7-6-7-12a7 7 0 1114 0c0 6-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" />
        </svg>
        <svg v-else-if="e.icon === 'stamp'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M10 2v4M14 2v4M4 10h16M8 14h8M6 18h12M4 10a2 2 0 012-2h12a2 2 0 012 2v10H4z" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
        </svg>
      </div>
      <div class="tl__body">
        <div class="tl__title" :class="{ 'tl__title--done': e.done }">{{ e.title }}</div>
        <div class="tl__desc">
          <span v-if="e.desc">{{ e.desc }} · </span>
          <span class="mono">{{ e.at }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tl {
  display: flex;
  flex-direction: column;
}
.tl__row {
  display: flex;
  gap: 14px;
  padding-bottom: 18px;
  position: relative;
}
.tl__row--last {
  padding-bottom: 0;
}
.tl__row:not(.tl__row--last)::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 32px;
  bottom: 0;
  width: 2px;
  background: var(--lf-line);
}
.tl__icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--lf-line);
  color: var(--lf-ink-4);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.tl__icon--done {
  background: var(--lf-brand-050);
  border-color: var(--lf-brand);
  color: var(--lf-brand);
}
.tl__body {
  flex: 1;
  padding-top: 5px;
}
.tl__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--lf-ink-3);
}
.tl__title--done {
  color: var(--lf-ink);
}
.tl__desc {
  font-size: 11.5px;
  color: var(--lf-ink-4);
  margin-top: 2px;
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
</style>
