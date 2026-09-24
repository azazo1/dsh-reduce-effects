import { describe, expect, it, vi } from 'vitest'
import { installReducedMotionOverride, reducedMotionVerdict } from '../src/client/media-override.ts'

/** Minimal window carrying one spied `matchMedia`. */
function fakeWindow(): { win: Window; native: ReturnType<typeof vi.fn> } {
  const native = vi.fn((query: string) => ({ media: query, matches: false }) as MediaQueryList)
  return { win: { matchMedia: native } as unknown as Window, native }
}

describe('reducedMotionVerdict', () => {
  it('answers reduce and its opposite form', () => {
    expect(reducedMotionVerdict('(prefers-reduced-motion: reduce)')).toBe(true)
    expect(reducedMotionVerdict('(prefers-reduced-motion: no-preference)')).toBe(false)
  })

  it('defers every other query to the browser', () => {
    expect(reducedMotionVerdict('(min-width: 600px)')).toBeUndefined()
    expect(reducedMotionVerdict('(prefers-color-scheme: dark)')).toBeUndefined()
  })
})

describe('installReducedMotionOverride', () => {
  it('forces reduce, keeps no-preference false, and forwards other queries', () => {
    const { win, native } = fakeWindow()
    const restore = installReducedMotionOverride(win)
    expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
    expect(win.matchMedia('(prefers-reduced-motion: no-preference)').matches).toBe(false)
    win.matchMedia('(min-width: 600px)')
    expect(native).toHaveBeenCalledWith('(min-width: 600px)')
    restore()
    expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false)
    expect(native).toHaveBeenCalledTimes(2)
  })

  it('keeps a later replacement of matchMedia intact on dispose', () => {
    const { win } = fakeWindow()
    const restore = installReducedMotionOverride(win)
    const replacement = ((query: string) => ({ media: query, matches: true }) as MediaQueryList) as typeof win.matchMedia
    win.matchMedia = replacement
    restore()
    expect(win.matchMedia).toBe(replacement)
  })
})
