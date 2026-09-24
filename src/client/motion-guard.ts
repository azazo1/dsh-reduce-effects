/**
 * 运行时逐个筛动画: 两档开关各自关掉一半时, CSS 无法按关键帧名区分加载指示器,
 * 所以只关装饰动画或只关加载动画都要在这里做.
 *
 * 安装时先扫一遍文档里已有的动画, 之后用 `animationstart` 接住新出现的动画:
 * 无限循环的动画直接 cancel (元素回到基础样式), 一次性的入场动画 finish 到终态
 * (元素停在动画结束的样子). 判据见 `loading-animation.ts`.
 */

import { isLoadingAnimation } from './loading-animation.ts'

/**
 * 筛选模式, 以 "留下哪一类" 命名.
 * - `keep-loading`: 收掉装饰动画, 放行加载与进度指示器.
 * - `stop-loading`: 只收掉加载与进度指示器, 装饰动画照常.
 */
export type MotionGuardMode = 'keep-loading' | 'stop-loading'

/**
 * 取一个动画的关键帧名.
 * @param animation - 待判定的动画.
 * @returns 关键帧名; 过渡 (CSSTransition) 没有名字, 返回 undefined.
 */
function keyframeNameOf(animation: Animation): string | undefined {
  const name = (animation as CSSAnimation).animationName
  return typeof name === 'string' && name !== '' ? name : undefined
}

/**
 * 结束一个动画.
 * @param animation - 待结束的动画.
 */
function settle(animation: Animation): void {
  if (animation.effect?.getTiming().iterations === Infinity) animation.cancel()
  else animation.finish()
}

/**
 * 某种模式下, 一个关键帧名是否该被收掉.
 * @param mode - 筛选模式.
 * @param name - 关键帧名.
 * @returns true 表示结束这个动画.
 */
export function guardStops(mode: MotionGuardMode, name: string): boolean {
  return mode === 'keep-loading' ? !isLoadingAnimation(name) : isLoadingAnimation(name)
}

/**
 * 对一批动画执行筛选.
 * @param animations - 待筛的动画, 通常是 `getAnimations()` 的结果.
 * @param mode - 筛选模式.
 */
export function guardAnimations(animations: readonly Animation[], mode: MotionGuardMode): void {
  for (const animation of animations) {
    const name = keyframeNameOf(animation)
    if (name === undefined || !guardStops(mode, name)) continue
    try {
      settle(animation)
    } catch {
      // 已经被其他代码结束或取消的动画会抛异常, 这里不需要补救.
    }
  }
}

/**
 * 读一个对象身上正在跑的动画.
 *
 * 只要求存在 `getAnimations`, 不要求它是 `Element`: 事件目标是 Node, jsdom 里
 * 连 `Document.getAnimations` 都可能没有, 缺了就当成没有动画.
 * @param host - 文档或元素.
 * @returns 该对象上的动画, 没有 Web Animations 时为空.
 */
function animationsOf(host: unknown): readonly Animation[] {
  const source = host as { getAnimations?: () => Animation[] } | null | undefined
  return typeof source?.getAnimations === 'function' ? source.getAnimations() : []
}

/**
 * 在文档上安装筛选器, 并立即扫一遍已有动画.
 * @param doc - 目标文档.
 * @param mode - 筛选模式.
 * @returns 卸载函数; 已经取消的动画不会因此恢复, 需要等组件重新渲染.
 */
export function installMotionGuard(doc: Document, mode: MotionGuardMode): () => void {
  const onAnimationStart = (event: Event): void => {
    guardAnimations(animationsOf(event.target), mode)
  }
  guardAnimations(animationsOf(doc), mode)
  doc.addEventListener('animationstart', onAnimationStart, true)
  return () => {
    doc.removeEventListener('animationstart', onAnimationStart, true)
  }
}
