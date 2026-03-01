/**
 * Silent catch handler for background API calls.
 * Logs errors in development mode only (tree-shaken in production).
 */
export function silentCatch(context: string) {
  return (err: unknown) => {
    if (import.meta.env.DEV) {
      console.warn(`[${context}]`, err)
    }
  }
}
