import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
  duration: number
}

const MAX_VISIBLE = 3

const state = reactive<{ toasts: Toast[] }>({
  toasts: [],
})

let nextId = 1

function show(opts: { type: ToastType; title: string; message?: string; duration?: number }): number {
  const duration = opts.duration ?? (opts.type === 'error' || opts.type === 'warning' ? 8000 : 5000)
  const toast: Toast = {
    id: nextId++,
    type: opts.type,
    title: opts.title,
    message: opts.message,
    duration,
  }
  state.toasts.push(toast)
  if (state.toasts.length > MAX_VISIBLE) {
    state.toasts.splice(0, state.toasts.length - MAX_VISIBLE)
  }
  setTimeout(() => dismiss(toast.id), duration)
  return toast.id
}

function dismiss(id: number) {
  const idx = state.toasts.findIndex(t => t.id === id)
  if (idx >= 0) state.toasts.splice(idx, 1)
}

export const toastStore = { state, show, dismiss }
