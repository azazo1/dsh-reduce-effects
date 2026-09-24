/**
 * Keeps the page in sync with the effective plan: one owned stylesheet, the
 * optional media-query override and the optional runtime animation guard, all
 * applied idempotently.
 */

import { removeStyle, upsertStyle } from './dom-style.ts'
import { effectCss } from './effect-css.ts'
import type { EffectPlan } from './effect-plan.ts'
import { installReducedMotionOverride } from './media-override.ts'
import { installMotionGuard, type MotionGuardMode } from './motion-guard.ts'

/** Everything the controller touches outside itself. */
export interface EffectTarget {
  /** Document receiving the stylesheet. */
  doc: Document
  /** Window whose `matchMedia` answers the reduced-motion queries. */
  win: Window
  /** `data-plugin-css` marker of the stylesheet this controller owns. */
  styleMark: string
}

/**
 * 一个计划需要哪种运行时筛选.
 * @param plan - the effective plan.
 * @returns 筛选模式; 动画与加载动画同开或同关时都由 CSS 搞定, 返回 undefined.
 */
export function motionGuardModeFor(plan: EffectPlan): MotionGuardMode | undefined {
  if (plan.motion) return plan.spinnerMotion ? undefined : 'stop-loading'
  return plan.spinnerMotion ? 'keep-loading' : undefined
}

/** Applies one plan to the page and follows later plans. */
export class EffectsController {
  private readonly target: EffectTarget
  private restoreMatchMedia: (() => void) | undefined
  private restoreMotionGuard: (() => void) | undefined
  private motionGuardMode: MotionGuardMode | undefined

  /** @param target - the document, window and style marker this controller owns. */
  constructor(target: EffectTarget) {
    this.target = target
  }

  /**
   * Apply a plan. Repeated calls are idempotent, so a settings snapshot that
   * did not change costs one string comparison.
   *
   * 样式表负责过渡与 "动画全关" 这两档; 只关其中一边时, 动画的取舍交给运行时
   * 筛选, 因为 CSS 没法按关键帧名区分加载指示器.
   * @param plan - the effective plan.
   */
  apply(plan: EffectPlan): void {
    const css = effectCss(plan)
    if (css === '') removeStyle(this.target.doc, this.target.styleMark)
    else upsertStyle(this.target.doc, this.target.styleMark, css)
    const mode = motionGuardModeFor(plan)
    if (mode !== this.motionGuardMode) {
      this.restoreMotionGuard?.()
      this.restoreMotionGuard = mode === undefined ? undefined : installMotionGuard(this.target.doc, mode)
      this.motionGuardMode = mode
    }
    if (plan.jsMotion) {
      this.restoreMatchMedia?.()
      this.restoreMatchMedia = undefined
    } else {
      this.restoreMatchMedia ??= installReducedMotionOverride(this.target.win)
    }
  }

  /** Drop the stylesheet and the overrides; the page returns to its own behavior. */
  dispose(): void {
    removeStyle(this.target.doc, this.target.styleMark)
    this.restoreMotionGuard?.()
    this.restoreMotionGuard = undefined
    this.motionGuardMode = undefined
    this.restoreMatchMedia?.()
    this.restoreMatchMedia = undefined
  }
}
