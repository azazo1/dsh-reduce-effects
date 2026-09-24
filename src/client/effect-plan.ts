/** Resolution of the stored preferences into the effects actually kept on. */

import type { ReduceEffectsSettings } from '../settings.ts'

/** One boolean decision per switchable effect category, true meaning "keep it". */
export interface EffectPlan {
  /** 动画与过渡: 关掉后停装饰动画, 过渡压到 1 毫秒. */
  motion: boolean
  /** 加载与进度动画: 关掉后进度条与加载指示器也停. */
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
  /** Keep DSH's own JS motion instead of forcing its reduce-motion branch. */
  jsMotion: boolean
}

/**
 * Fold the stored preferences into the effective plan.
 * @param settings - normalized preference section.
 * @returns 每个分类最终是否保持开启.
 *
 * 总开关关掉时, 除豁免分类外一律关闭; 总开关打开时各分类听自己的开关.
 * 豁免分类 (加载与进度动画) 属于功能反馈, 总开关不代管它.
 */
export function resolveEffectPlan(settings: ReduceEffectsSettings): EffectPlan {
  const master = settings.master
  return {
    motion: master && settings.motion,
    spinnerMotion: settings.spinnerMotion,
    blur: master && settings.blur,
    smoothScroll: master && settings.smoothScroll,
    hoverMarquee: master && settings.hoverMarquee,
    decoration: master && settings.decoration,
    gradients: master && settings.gradients,
    jsMotion: master && settings.jsMotion,
  }
}

/**
 * Whether a plan asks for nothing at all.
 * @param plan - the effective plan.
 * @returns true when every category stays on, which is the untouched DSH look.
 */
export function planIsIdle(plan: EffectPlan): boolean {
  return plan.motion && plan.spinnerMotion && plan.blur && plan.smoothScroll
    && plan.hoverMarquee && plan.decoration && plan.gradients && plan.jsMotion
}
