/** Resolution of the stored preferences into the effects actually turned off. */

import type { ReduceEffectsSettings } from '../settings.ts'

/** One boolean decision per switchable effect category. */
export interface EffectPlan {
  /** 停掉 CSS 过渡与装饰性动画. */
  motion: boolean
  /** 连加载指示器与进度条的动画也一起停掉. */
  spinnerMotion: boolean
  /** Drop backdrop blur (frosted menus and floating surfaces). */
  blur: boolean
  /** Scroll containers land immediately instead of easing. */
  smoothScroll: boolean
  /** Stop sidebar session titles from crawling sideways under the pointer. */
  hoverMarquee: boolean
  /** Drop shadows and the superellipse corner shape. */
  decoration: boolean
  /** Drop gradient background images. */
  gradients: boolean
  /** Make page code observe "reduce motion" from the system preference. */
  jsMotion: boolean
}

/**
 * Fold the stored preferences into the effective plan. The master switch wins
 * over every category, which is what makes it a single one-click kill.
 * @param settings - normalized preference section.
 * @returns the effective decision per category.
 *
 * 总开关只被 settings 里标记为豁免的分类挡下一次: 加载指示器的动画属于功能反馈.
 */
export function resolveEffectPlan(settings: ReduceEffectsSettings): EffectPlan {
  const forced = settings.master
  return {
    motion: forced || settings.motion,
    // 加载与进度动画是功能反馈, 总开关不代管, 只有本项开关能停掉.
    spinnerMotion: settings.spinnerMotion,
    blur: forced || settings.blur,
    smoothScroll: forced || settings.smoothScroll,
    hoverMarquee: forced || settings.hoverMarquee,
    decoration: forced || settings.decoration,
    gradients: forced || settings.gradients,
    jsMotion: forced || settings.jsMotion,
  }
}

/**
 * Whether a plan asks for nothing at all.
 * @param plan - the effective plan.
 * @returns true when no category is switched on.
 */
export function planIsIdle(plan: EffectPlan): boolean {
  // spinnerMotion 单独打开时什么也不改变: 它只在 motion 也打开时才有落点.
  return !plan.motion && !plan.blur && !plan.smoothScroll && !plan.hoverMarquee
    && !plan.decoration && !plan.gradients && !plan.jsMotion
}
