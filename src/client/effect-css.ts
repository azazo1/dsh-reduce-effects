/**
 * Stylesheet text for one plan. Every rule is `!important` because it must win
 * over component styles compiled into the shell, and every selector is a
 * universal one because the shell's class names are hashed per build.
 */

import type { EffectPlan } from './effect-plan.ts'

/**
 * Durations collapse to one millisecond instead of `none`: the browser still
 * fires `transitionend`, so components that settle on those events keep working.
 */
const TRANSITION_RULES = `*, *::before, *::after {
  transition-duration: 1ms !important;
  transition-delay: 0s !important;
}`

/**
 * Animations collapse the same way, and stop after their single pass.
 *
 * 这一档只在连加载与进度动画一起停的时候才发出去; 否则动画交给运行时逐个筛
 * (见 `motion-guard.ts`), 把加载指示器与进度条留下.
 */
const ANIMATION_RULES = `*, *::before, *::after {
  animation-duration: 1ms !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
}`

/** Backdrop filters are the frosted menu and overlay material. */
const BLUR_RULES = `*, *::before, *::after {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}`

/** Native smooth scrolling, including programmatic `scrollIntoView` easing. */
const SMOOTH_SCROLL_RULES = `*, *::before, *::after {
  scroll-behavior: auto !important;
}`

/**
 * 侧栏会话行的标题在悬停时被脚本逐帧拖动 (直接改 scrollLeft), 既不是 CSS 动画也
 * 不是平滑滚动, 所以前面两档都收不住它. 这里把那几个格子变成非滚动容器:
 * `overflow: clip` 的元素不再是滚动容器, scrollTo 与 scrollLeft 都没有落点, 文字
 * 停在省略号处; 顺带清掉拖动时才挂上的边缘渐隐 mask.
 *
 * 选择器按行上的 `data-row-key="session:..."` 定位, 那是渲染期写入的稳定标记.
 * 标题是行里的第 2 个 span (第 1 个是状态点), 没有状态点的行会提到第 1 位, 因此
 * 两条都写上; 只影响会话行, 项目行与 "显示更多" 行不动.
 */
const HOVER_TITLE_RULES = `[data-row-key^="session:"] > span:nth-child(1),
[data-row-key^="session:"] > span:nth-child(2) {
  overflow: clip !important;
}

[data-row-key^="session:"] > span[data-scrolled],
[data-row-key^="session:"] > span[data-clipped] {
  mask-image: none !important;
}`

/** Shadows paint panel strokes as well, so surfaces lose their hairline edge. */
const DECORATION_RULES = `*, *::before, *::after {
  box-shadow: none !important;
  text-shadow: none !important;
  corner-shape: round !important;
}`

/**
 * Gradient washes live on `background-image`, which artwork also uses.
 *
 * 渐变还会被当作 "颜料" 用来画字: DSH 的运行中文字用 `background-clip: text` 加
 * 透明填充, 文字本身只有那个渐变可见. 去掉渐变时必须同时把填充色还给文字, 否则
 * 整行字会消失; 这一句和 DSH 自己在减少动态效果时的降级写法一致.
 */
const GRADIENT_RULES = `*, *::before, *::after {
  background-image: none !important;
  -webkit-text-fill-color: currentColor !important;
}`

/**
 * Build the stylesheet for one plan.
 * @param plan - the effective plan.
 * @returns the stylesheet text, or an empty string when nothing applies.
 */
export function effectCss(plan: EffectPlan): string {
  const blocks: string[] = []
  if (plan.motion) blocks.push(TRANSITION_RULES)
  if (plan.motion && plan.spinnerMotion) blocks.push(ANIMATION_RULES)
  if (plan.blur) blocks.push(BLUR_RULES)
  if (plan.smoothScroll) blocks.push(SMOOTH_SCROLL_RULES)
  if (plan.hoverMarquee) blocks.push(HOVER_TITLE_RULES)
  if (plan.decoration) blocks.push(DECORATION_RULES)
  if (plan.gradients) blocks.push(GRADIENT_RULES)
  return blocks.join('\n\n')
}
