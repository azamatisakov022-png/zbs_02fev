import html2pdf from 'html2pdf.js'

/**
 * Generate and download a PDF from an HTML element.
 * The element is cloned offscreen so the user sees no flicker.
 */
export async function downloadElementAsPdf(
  el: HTMLElement,
  filename: string,
  options?: { margin?: number; scale?: number },
) {
  const margin = options?.margin ?? 10
  const scale = options?.scale ?? 2

  await html2pdf()
    .set({
      margin,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(el)
    .save()
}
