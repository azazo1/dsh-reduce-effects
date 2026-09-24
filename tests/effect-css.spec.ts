import { describe, expect, it } from 'vitest'
import { effectCss } from '../src/client/effect-css.ts'
import type { EffectPlan } from '../src/client/effect-plan.ts'

const EVERYTHING_ON: EffectPlan = {
  motion: true,
  spinnerMotion: true,
  blur: true,
  smoothScroll: true,
  hoverMarquee: true,
  decoration: true,
  gradients: true,
  jsMotion: true,
}

const plan = (overrides: Partial<EffectPlan>): EffectPlan => ({ ...EVERYTHING_ON, ...overrides })

describe('effectCss', () => {
  it('emits nothing while every effect stays on', () => {
    expect(effectCss(EVERYTHING_ON)).toBe('')
  })

  it('collapses transitions, and leaves animations to the runtime guard', () => {
    const css = effectCss(plan({ motion: false }))
    expect(css).toContain('transition-duration: 1ms !important')
    expect(css).not.toContain('animation-duration')
    expect(css).not.toContain('animation: none')
  })

  it('collapses animations too when loading feedback is switched off as well', () => {
    const css = effectCss(plan({ motion: false, spinnerMotion: false }))
    expect(css).toContain('animation-duration: 1ms !important')
    expect(css).toContain('animation-iteration-count: 1 !important')
    expect(css).toContain('transition-duration: 1ms !important')
    expect(css).not.toContain('animation: none')
  })

  it('leaves loading-only changes to the runtime guard', () => {
    expect(effectCss(plan({ spinnerMotion: false }))).toBe('')
  })

  it('drops the frosted material and the smooth scroll easing', () => {
    const css = effectCss(plan({ blur: false, smoothScroll: false }))
    expect(css).toContain('backdrop-filter: none !important')
    expect(css).toContain('scroll-behavior: auto !important')
    // 只去掉模糊会留下半透明的菜单底色, 浮层会变得透明; 底色要一并换成不透明的层色.
    expect(css).toContain('--dsw-menu-backdrop-filter: none !important')
    expect(css).toContain('--dsw-specific-menu: var(--dsw-alias-bg-layer-2')
    // 层色 token 亮暗主题都有, 不写字面量 fallback, 否则另一套主题会错色.
    expect(css).not.toContain('#2c2c2e')
  })

  it('takes the hover marquee off its scroll container and clears its masks', () => {
    const css = effectCss(plan({ hoverMarquee: false }))
    expect(css).toContain('[data-row-key^="session:"]')
    expect(css).toContain('overflow: clip !important')
    expect(css).toContain('mask-image: none !important')
  })

  it('drops shadows, the superellipse corner and gradient washes', () => {
    const css = effectCss(plan({ decoration: false, gradients: false }))
    expect(css).toContain('box-shadow: none !important')
    expect(css).toContain('corner-shape: round !important')
    expect(css).toContain('background-image: none !important')
    // 渐变被去掉后, 用渐变当颜料的文字必须拿回填充色, 否则整行字会消失.
    expect(css).toContain('-webkit-text-fill-color: currentColor !important')
  })

  it('gives the docked composer seat an opaque base once the gradient is gone', () => {
    const css = effectCss(plan({ gradients: false }))
    // 座位的不透明底板本来就只是一条 background-image 渐变, 删掉后座位整块透明,
    // 滚动中的消息会从输入框后面穿出来, 所以补一层跟随主题的纯色底.
    expect(css).toContain('background-color: var(--dsw-alias-bg-base) !important')
    expect(css).toContain("[data-phase='active'] [data-composer-seat]")
    expect(css).toContain("[data-content-phase='active'] [data-composer-seat]")
  })

  it('leaves the runtime-only category out of the stylesheet', () => {
    expect(effectCss(plan({ jsMotion: false }))).toBe('')
  })
})
