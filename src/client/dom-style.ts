/**
 * One owned `<style>` element, addressed by its `data-plugin-css` marker so a
 * repeated call updates the existing sheet instead of stacking another one.
 */

/**
 * Insert or update the stylesheet carrying one marker.
 * @param doc - document owning the head.
 * @param mark - value of the `data-plugin-css` marker.
 * @param css - stylesheet text to publish.
 * @returns the managed element, or undefined when no head is available yet.
 */
export function upsertStyle(doc: Document, mark: string, css: string): HTMLStyleElement | undefined {
  const head = doc.head
  if (head === null) return undefined
  const existing = doc.querySelector<HTMLStyleElement>(`style[data-plugin-css="${mark}"]`)
  const style = existing ?? doc.createElement('style')
  if (existing === null) {
    style.dataset['pluginCss'] = mark
    head.appendChild(style)
  }
  if (style.textContent !== css) style.textContent = css
  return style
}

/**
 * Remove the stylesheet carrying one marker.
 * @param doc - document owning the head.
 * @param mark - value of the `data-plugin-css` marker.
 */
export function removeStyle(doc: Document, mark: string): void {
  doc.querySelector<HTMLStyleElement>(`style[data-plugin-css="${mark}"]`)?.remove()
}
