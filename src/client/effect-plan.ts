/** Resolution of the stored preferences into the effects actually kept on. */

import type { ReduceEffectsSettings } from '../settings.ts'

/** One boolean decision per switchable effect category, true meaning "keep it". */
export interface EffectPlan {
  /** 动画与过渡: 关掉后停装饰动画, 过渡压到 1 毫秒. */
  motion: boolean
  /** 加载与进度动画: 关掉后进度条与加载指示器也停. */
  spinnerMotion: boolean
  /** 文字流光: 关掉后运行中节点文字上扫动的高光不再出现. */
  textShimmer: boolean
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
 * 总开关是总闸: 关掉后各分类一律不生效; 打开时每个分类听自己的开关.
 * 它只决定生不生效, 不改动各分类自己的值, 所以重新打开时原样恢复.
 */
export function resolveEffectPlan(settings: ReduceEffectsSettings): EffectPlan {
  const master = settings.master
  return {
    motion: master && settings.motion,
    spinnerMotion: master && settings.spinnerMotion,
    textShimmer: master && settings.textShimmer,
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
  return plan.motion && plan.spinnerMotion && plan.textShimmer && plan.blur && plan.smoothScroll
    && plan.hoverMarquee && plan.decoration && plan.gradients && plan.jsMotion
}
