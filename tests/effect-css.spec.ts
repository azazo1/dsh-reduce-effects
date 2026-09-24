import { describe, expect, it } from 'vitest'
import { effectCss } from '../src/client/effect-css.ts'
import type { EffectPlan } from '../src/client/effect-plan.ts'

const IDLE: EffectPlan = {
  motion: false,
  spinnerMotion: false,
  blur: false,
  smoothScroll: false,
  hoverMarquee: false,
  decoration: false,
  gradients: false,
  jsMotion: false,
}

const plan = (overrides: Partial<EffectPlan>): EffectPlan => ({ ...IDLE, ...overrides })

describe('effectCss', () => {
  it('emits nothing for an idle plan', () => {
    expect(effectCss(IDLE)).toBe('')
  })

  it('collapses transitions, and leaves animations to the runtime guard', () => {
    const css = effectCss(plan({ motion: true }))
    expect(css).toContain('transition-duration: 1ms !important')
    expect(css).not.toContain('animation-duration')
    expect(css).not.toContain('animation: none')
  })

  it('collapses animations too when loading feedback is switched off as well', () => {
    const css = effectCss(plan({ motion: true, spinnerMotion: true }))
    expect(css).toContain('animation-duration: 1ms !important')
    expect(css).toContain('animation-iteration-count: 1 !important')
    expect(css).toContain('transition-duration: 1ms !important')
    expect(css).not.toContain('animation: none')
  })

  it('ignores the loading switch while motion itself is untouched', () => {
    expect(effectCss(plan({ spinnerMotion: true }))).toBe('')
  })

  it('drops the frosted material and the smooth scroll easing', () => {
    const css = effectCss(plan({ blur: true, smoothScroll: true }))
    expect(css).toContain('backdrop-filter: none !important')
    expect(css).toContain('scroll-behavior: auto !important')
  })

  it('takes the hover marquee off its scroll container and clears its masks', () => {
    const css = effectCss(plan({ hoverMarquee: true }))
    expect(css).toContain('[data-row-key^="session:"]')
    expect(css).toContain('overflow: clip !important')
    expect(css).toContain('mask-image: none !important')
  })

  it('drops shadows, the superellipse corner and gradient washes', () => {
    const css = effectCss(plan({ decoration: true, gradients: true }))
    expect(css).toContain('box-shadow: none !important')
    expect(css).toContain('corner-shape: round !important')
    expect(css).toContain('background-image: none !important')
    // 渐变被去掉后, 用渐变当颜料的文字必须拿回填充色, 否则整行字会消失.
    expect(css).toContain('-webkit-text-fill-color: currentColor !important')
  })

  it('leaves the runtime-only category out of the stylesheet', () => {
    expect(effectCss(plan({ jsMotion: true }))).toBe('')
  })
})
