import type { Directive } from 'vue'

// Визуальные эффекты главной: появление при скролле (v-reveal).
// Уважает prefers-reduced-motion: при включённой настройке контент показывается сразу.

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** v-reveal[="delayMs"] - элемент плавно появляется, когда попадает в видимую область. */
export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (prefersReducedMotion()) return
    el.classList.add('fx-reveal')
    if (binding.value) el.style.setProperty('--fx-delay', `${binding.value}ms`)
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('fx-reveal-in')
            io.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
  },
}
