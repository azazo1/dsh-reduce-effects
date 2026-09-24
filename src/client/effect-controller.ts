/**
 * Keeps the page in sync with the effective plan: one owned stylesheet plus the
 * optional media-query override, both applied idempotently.
 */

import { removeStyle, upsertStyle } from './dom-style.ts'
import { effectCss } from './effect-css.ts'
import type { EffectPlan } from './effect-plan.ts'
import { installReducedMotionOverride } from './media-override.ts'
import { installMotionGuard } from './motion-guard.ts'

/** Everything the controller touches outside itself. */
export interface EffectTarget {
  /** Document receiving the stylesheet. */
  doc: Document
  /** Window whose `matchMedia` answers the reduced-motion queries. */
  win: Window
  /** `data-plugin-css` marker of the stylesheet this controller owns. */
  styleMark: string
}

/** Applies one plan to the page and follows later plans. */
export class EffectsController {
  private readonly target: EffectTarget
  private restoreMatchMedia: (() => void) | undefined
  private restoreMotionGuard: (() => void) | undefined

  /** @param target - the document, window and style marker this controller owns. */
  constructor(target: EffectTarget) {
    this.target = target
  }

  /**
   * Apply a plan. Repeated calls are idempotent, so a settings snapshot that
   * did not change costs one string comparison.
   *
   * 样式表负责过渡与 "连加载动画一起停" 这两档; 只停装饰动画时, 动画的取舍
   * 交给运行时筛选, 因为 CSS 没法按关键帧名区分加载指示器.
   * @param plan - the effective plan.
   */
  apply(plan: EffectPlan): void {
    const css = effectCss(plan)
    if (css === '') removeStyle(this.target.doc, this.target.styleMark)
    else upsertStyle(this.target.doc, this.target.styleMark, css)
    if (plan.motion && !plan.spinnerMotion) {
      this.restoreMotionGuard ??= installMotionGuard(this.target.doc)
    } else {
      this.restoreMotionGuard?.()
      this.restoreMotionGuard = undefined
    }
    if (plan.jsMotion) {
      this.restoreMatchMedia ??= installReducedMotionOverride(this.target.win)
    } else {
      this.restoreMatchMedia?.()
      this.restoreMatchMedia = undefined
    }
  }

  /** Drop the stylesheet and the overrides; the page returns to its own behavior. */
  dispose(): void {
    removeStyle(this.target.doc, this.target.styleMark)
    this.restoreMotionGuard?.()
    this.restoreMotionGuard = undefined
    this.restoreMatchMedia?.()
    this.restoreMatchMedia = undefined
  }
}
