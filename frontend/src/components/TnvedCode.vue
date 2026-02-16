<script setup lang="ts">
import { ref, computed } from 'vue'
import { tnvedNotes, parseTnvedCode } from '../data/tnved-notes'

const props = defineProps<{ code: string }>()

const parsed = computed(() => parseTnvedCode(props.code))

// Tooltip state
const activeNote = ref<string | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
const badgeRefs = ref<Record<string, HTMLElement>>({})

function showTooltip(noteNum: string, event: MouseEvent) {
  activeNote.value = noteNum
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  if (spaceBelow > 120) {
    tooltipStyle.value = {
      top: (rect.height + 6) + 'px',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: 'auto'
    }
  } else {
    tooltipStyle.value = {
      bottom: (rect.height + 6) + 'px',
      left: '50%',
      transform: 'translateX(-50%)',
      top: 'auto'
    }
  }
}

function hideTooltip() {
  activeNote.value = null
}
</script>

<template>
  <span class="tnved-code">
    <span class="tnved-code__text">{{ parsed.cleanCode }}</span>
    <span
      v-for="n in parsed.notes"
      :key="n"
      class="tnved-code__badge-wrap"
      @mouseenter="showTooltip(n, $event)"
      @mouseleave="hideTooltip"
      @focus="showTooltip(n, $event)"
      @blur="hideTooltip"
      tabindex="0"
    >
      <span class="tnved-code__badge">{{ n }}</span>
      <Transition name="tnved-tip">
        <div v-if="activeNote === n" class="tnved-code__tooltip" :style="tooltipStyle">
          {{ tnvedNotes[n] || 'Примечание ' + n }}
        </div>
      </Transition>
    </span>
  </span>
</template>

<style scoped>
.tnved-code {
  display: inline;
  white-space: nowrap;
}
.tnved-code__text {
  /* inherits parent styles */
}
.tnved-code__badge-wrap {
  position: relative;
  display: inline-flex;
  margin-left: 4px;
  vertical-align: super;
  outline: none;
}
.tnved-code__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #EFF6FF;
  color: #3B82F6;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  line-height: 1;
}
.tnved-code__badge:hover {
  background: #DBEAFE;
  transform: scale(1.15);
}
.tnved-code__tooltip {
  position: absolute;
  z-index: 1000;
  background: #1E293B;
  color: white;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  max-width: 350px;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: normal;
  text-align: left;
  pointer-events: none;
  font-weight: 400;
  width: max-content;
}
.tnved-tip-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.tnved-tip-leave-active { transition: opacity 0.1s ease; }
.tnved-tip-enter-from { opacity: 0; transform: translateX(-50%) translateY(4px); }
.tnved-tip-leave-to { opacity: 0; }
</style>
