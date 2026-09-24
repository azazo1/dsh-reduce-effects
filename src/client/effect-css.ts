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
 * 这一档只在动画与加载动画同时关掉时才发出去; 只关一边时动画交给运行时逐个筛
 * (见 `motion-guard.ts`), 该留的留下.
 */
const ANIMATION_RULES = `*, *::before, *::after {
  animation-duration: 1ms !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
}`

/**
 * 运行中节点文字上那道来回扫动的高光 (DSH 的 TextShimmer): 一条渐变被
 * `background-clip: text` 当颜料涂在字上, 再由 `dsh-text-shimmer` 关键帧推着
 * 扫过整行. 关掉这一档就是照 DSH 自己在减少动态效果下的降级写法把两样都收掉:
 * 去掉颜料后必须把填充色还给文字, 否则整行字会消失.
 *
 * 选择器用组件自己写在元素上的 `data-text-shimmer` (只在 active 时出现), 它是
 * 渲染期写入的稳定标记, 不随构建期类名哈希变化.
 *
 * 这一档是单向的: 只负责 "关掉它就去掉流光", 不阻止别处顺带收掉流光 -- 关掉
 * "渐变背景" 或 "动画与过渡" 时它同样会消失.
 */
const SHIMMER_RULES = `[data-text-shimmer] {
  background-image: none !important;
  -webkit-text-fill-color: currentColor !important;
  animation: none !important;
}`

/**
 * 运行中整行扫过的那道高光 (DSH 的思考行与技能行), 和上一档不是同一个东西.
 *
 * 它不是 TextShimmer: 组件在行容器上挂一个 `::after`, 铺一条 300px 宽的横向渐变,
 * 再用 `dsh-reasoning-row-sweep` / `dsh-skill-row-sweep` 关键帧把它从左端推到右端,
 * 2.6 秒一轮. 文字颜料那一档碰不到它, 所以关掉流光时这里要单独收一次. 两处都只在
 * 运行中状态挂出来: 思考行是 `running`, 技能行是 `running` 与 `preparing`.
 *
 * 只停动画不够 -- 关键帧一停, 伪元素会留在起始帧的 `left: 0`, 那 300px 渐变照样画在
 * 行上; 所以直接把伪元素的 `content` 去掉, 让它根本不生成.
 *
 * 定位到行容器同样靠渲染期写入的稳定标记: 思考行是它根上的 `data-variant="think"`
 * 加 DisclosureRow 的 `data-disclosure-row`, 技能行是卡片上的 `data-tool="skill"`
 * 加它的直接子 div. 类名是构建期哈希的, 用不了.
 */
const ROW_SWEEP_RULES = `[data-variant='think'][data-state='running'] [data-disclosure-row]::after,
[data-tool='skill'][data-state='running'] > div::after,
[data-tool='skill'][data-state='preparing'] > div::after {
  content: none !important;
}`

/**
 * Frosted menus and overlays are two pieces: the shell keeps the blur in
 * `--dsw-menu-backdrop-filter` and the see-through fill in a colour token.
 * Dropping only the filter would leave that translucent colour in place, and an
 * overlay would read as a transparent panel with whatever sits behind it showing
 * through; the fill therefore also swaps to an opaque layer token, which is what
 * "no frosted material" is supposed to look like.
 *
 * Two fill tokens are in play since 0.1.7-rc.2. The shared `MenuSurface` material
 * paints `--dsw-menu-surface-fill`, while the older `--dsw-specific-menu` (still
 * read by hover cards, docks and selection menus) only aliases it. Overriding the
 * alias alone would leave every `MenuSurface` translucent, so both names are set
 * to the same opaque layer.
 *
 * Both variables are declared on `body` and on its platform/theme variants, so
 * they are set on `*` instead of on a wrapper: a declaration on the element
 * itself always beats the inherited value, whatever specificity the shell's own
 * selector carries.
 *
 * 层色 token 在亮色与暗色主题里都有定义 (`--dsw-alias-bg-layer-2` 见
 * design-platform.css 的亮暗两处), 所以这里不写字面量 fallback: 死值只能是某一套
 * 主题的近似色, 万一 token 缺失就会在另一套主题下用错色.
 */
const BLUR_RULES = `*, *::before, *::after {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

* {
  --dsw-menu-backdrop-filter: none !important;
  --dsw-specific-menu: var(--dsw-alias-bg-layer-2) !important;
  --dsw-menu-surface-fill: var(--dsw-alias-bg-layer-2) !important;
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
 * 标题固定是行里的第 2 个格子: 第 1 个是状态点槽, 自 0.1.7-rc.2 起无条件渲染, 标题
 * 因此不会像更早的版本那样提到第 1 位. 只影响会话行, 项目行与 "显示更多" 行不动.
 */
const HOVER_TITLE_RULES = `[data-row-key^="session:"] > span:nth-child(2) {
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
 *
 * 会话底部的输入区座位 (`[data-composer-seat]`) 另有一层用途: 它钉在滚动区底部,
 * 靠一条 "顶部全透明到 `--dsw-alias-bg-base`" 的竖向渐变盖住身后滚过去的消息,
 * 座位自己并没有别的底色. 渐变拿掉后座位整块透明, 消息会从输入框后面穿出来, 所以
 * 这里补一层不透明的页面底色, 顶部 36px 的渐隐带随之变成硬边.
 *
 * 选择器用渲染期写入的稳定标记: 座位只在固定与浮层这两种 active 布局下需要底色,
 * 空会话居中 (hero) 时它本来就没有背景, 不能平白多出一块底板.
 */
const GRADIENT_RULES = `*, *::before, *::after {
  background-image: none !important;
  -webkit-text-fill-color: currentColor !important;
}

[data-phase='active'] [data-composer-seat],
[data-content-phase='active'] [data-composer-seat] {
  background-color: var(--dsw-alias-bg-base) !important;
}`

/**
 * Build the stylesheet for one plan: 关掉的分类各出一段覆盖规则.
 * @param plan - the effective plan.
 * @returns the stylesheet text, or an empty string when nothing applies.
 */
export function effectCss(plan: EffectPlan): string {
  const blocks: string[] = []
  if (!plan.motion) blocks.push(TRANSITION_RULES)
  if (!plan.motion && !plan.spinnerMotion) blocks.push(ANIMATION_RULES)
  if (!plan.textShimmer) blocks.push(SHIMMER_RULES, ROW_SWEEP_RULES)
  if (!plan.blur) blocks.push(BLUR_RULES)
  if (!plan.smoothScroll) blocks.push(SMOOTH_SCROLL_RULES)
  if (!plan.hoverMarquee) blocks.push(HOVER_TITLE_RULES)
  if (!plan.decoration) blocks.push(DECORATION_RULES)
  if (!plan.gradients) blocks.push(GRADIENT_RULES)
  return blocks.join('\n\n')
}
