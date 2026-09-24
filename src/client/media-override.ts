/**
 * Answers `prefers-reduced-motion` queries as if the system asked for reduced
 * motion, so page code — the shell's own smooth-scrolling and paging branches,
 * and any other plugin's — takes its immediate path. Only that one feature is
 * touched; every other query still reaches the browser.
 */

/** Queries this override answers. */
const REDUCED_MOTION = /prefers-reduced-motion/i

/** The explicit opposite form, which must stay false while reduce is forced. */
const NO_PREFERENCE = /no-preference/i

/**
 * Decide the synthesized answer for one media query.
 * @param query - the raw query string handed to `matchMedia`.
 * @returns true or false when the query asks about reduced motion, otherwise
 * undefined so the caller defers to the browser.
 */
export function reducedMotionVerdict(query: string): boolean | undefined {
  if (!REDUCED_MOTION.test(query)) return undefined
  return NO_PREFERENCE.test(query) ? false : true
}

/** A media query list that never changes and never notifies. */
function staticQueryList(media: string, matches: boolean): MediaQueryList {
  return {
    media,
    matches,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList
}

/**
 * Install the override on one window.
 * @param win - window whose `matchMedia` is replaced.
 * @returns the disposer restoring the original function; it is a no-op when
 * someone else replaced `matchMedia` after this override.
 */
export function installReducedMotionOverride(win: Window): () => void {
  const native = win.matchMedia
  if (typeof native !== 'function') return () => {}
  const patched = function patchedMatchMedia(this: Window, query: string): MediaQueryList {
    const verdict = reducedMotionVerdict(query)
    if (verdict === undefined) return native.call(win, query)
    return staticQueryList(query, verdict)
  } as typeof win.matchMedia
  win.matchMedia = patched
  return () => {
    if (win.matchMedia === patched) win.matchMedia = native
  }
}
