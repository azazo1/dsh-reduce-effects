/**
 * 判定一个关键帧动画是不是加载/进度反馈.
 *
 * CSS 没有 "按 animation-name 选择元素" 的写法, 所以 "停掉装饰动画但保留加载
 * 动画" 只能放到运行时按名字筛. DSH 的类名是构建期哈希的, 关键帧名不是, 因此
 * 这里以 `Animation.animationName` 作判据.
 *
 * 提示词覆盖 DSH Web 当前的全部加载类动画:
 *   spin, spinner-rotate, file-card-spin, file-card-progress,
 *   dsh-state-dot-spin / -dash / -chase, reveal-second-dot, reveal-third-dot,
 *   input-pending, dsh-turn-mark-busy, terminal-cursor-blink
 * 新版本如果换了名字, 在这里补一条提示词即可.
 */

/** 关键帧名里出现任一提示词就视为加载反馈. */
const LOADING_HINTS = [
  'spin',
  'rotate',
  'progress',
  'loading',
  'loader',
  'busy',
  'pending',
  'blink',
  'dot',
] as const

/**
 * 关键帧名是否属于加载反馈.
 * @param name - `Animation.animationName`.
 * @returns true 表示这个动画应当继续播放.
 */
export function isLoadingAnimation(name: string): boolean {
  const lower = name.toLowerCase()
  return LOADING_HINTS.some(hint => lower.includes(hint))
}
