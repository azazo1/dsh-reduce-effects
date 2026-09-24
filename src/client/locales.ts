/** 插件页配置卡片的文案, 中英双语. */

import type { SettingsFormLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { LocaleDictOf } from '@deepseek-ai/dsh-client-ui-slots'

/** 本插件字典的命名空间, 与包名一致. */
export const LOCALE_NS = 'dsh-reduce-effects'

/** 本插件用到的文案键. */
export type ReduceEffectsKey =
  | 'description'
  | 'master' | 'masterHint'
  | 'motion' | 'motionHint'
  | 'spinnerMotion' | 'spinnerMotionHint'
  | 'blur' | 'blurHint'
  | 'smoothScroll' | 'smoothScrollHint'
  | 'hoverMarquee' | 'hoverMarqueeHint'
  | 'decoration' | 'decorationHint'
  | 'gradients' | 'gradientsHint'
  | 'jsMotion' | 'jsMotionHint'
  | 'overridden' | 'reset'
  | 'readOnly' | 'unavailable' | 'save' | 'saving' | 'saveFailed'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** 本插件配置卡片的文案. */
    'dsh-reduce-effects': ReduceEffectsKey
  }
}

export const zh: LocaleDictOf<typeof LOCALE_NS> = {
  description: '按需关闭 DSH Web 前端的动画, 模糊与装饰效果, 减少浏览器渲染负担.',
  master: '全部特效',
  masterHint: '总闸. 关掉后下面每个分类都不再生效, 各分类开关保留自己的值.',
  motion: '动画与过渡',
  motionHint: '关掉后停掉装饰性动画, 并把过渡压缩到 1 毫秒; 加载指示器与进度条由下面那一项单独控制.',
  spinnerMotion: '加载与进度动画',
  spinnerMotionHint: '关掉后进度条与加载指示器的动画也一起停, 界面看起来就像卡住.',
  blur: '毛玻璃与背景模糊',
  blurHint: '关掉后移除菜单和浮层的背景模糊.',
  smoothScroll: '平滑滚动',
  smoothScrollHint: '关掉后滚动与跳转立即到位, 不再缓动.',
  hoverMarquee: '标题 hover 滚动',
  hoverMarqueeHint: '关掉后侧栏会话标题停在省略号处, 鼠标悬停不再逐帧横向拖动.',
  decoration: '装饰元素',
  decorationHint: '关掉后隐藏纯装饰的背景与纹理.',
  gradients: '渐变',
  gradientsHint: '关掉后渐变一律渲染成纯色.',
  jsMotion: '脚本动画',
  jsMotionHint: '关掉后停掉由 JavaScript 驱动的位移动画.',
  overridden: '已覆盖',
  reset: '恢复默认',
  readOnly: '本部署的设置为只读.',
  unavailable: '该插件当前未加载, 暂时无法配置.',
  save: '保存',
  saving: '保存中...',
  saveFailed: '本部署没有接受这些值, 已保留供你修改.',
}

export const en: LocaleDictOf<typeof LOCALE_NS> = {
  description: 'Switch off frontend motion, blur, and decoration effects to cut rendering work.',
  master: 'All effects',
  masterHint: 'The master switch. Turning it off disables every category below while their own choices stay stored.',
  motion: 'Motion and transitions',
  motionHint: 'Stops decorative animation and compresses transitions to 1ms; spinners and progress bars stay under the next switch.',
  spinnerMotion: 'Spinner and progress motion',
  spinnerMotionHint: 'Also stops progress bar and spinner animation, which makes the interface look stalled.',
  blur: 'Backdrop blur',
  blurHint: 'Removes the blur behind menus and overlays.',
  smoothScroll: 'Smooth scrolling',
  smoothScrollHint: 'Scrolls and jumps land immediately instead of easing.',
  hoverMarquee: 'Hover marquee on titles',
  hoverMarqueeHint: 'Sidebar session titles stop at the ellipsis instead of scrolling under the pointer.',
  decoration: 'Decoration',
  decorationHint: 'Hides purely decorative backgrounds and textures.',
  gradients: 'Gradients',
  gradientsHint: 'Renders every gradient as a flat color.',
  jsMotion: 'Scripted motion',
  jsMotionHint: 'Stops translation animations driven by JavaScript.',
  overridden: 'Overridden',
  reset: 'Reset to default',
  readOnly: 'This deployment stores settings read-only.',
  unavailable: 'This plugin is not loaded, so it cannot be configured right now.',
  save: 'Save',
  saving: 'Saving...',
  saveFailed: 'The deployment did not accept these values; they were left for you to correct.',
}

/**
 * 表单框架要的文案, 从本插件字典取.
 * @param t - 本插件字典的读取函数.
 * @returns 共享设置表单渲染的标签.
 */
export function formLabels(t: (key: ReduceEffectsKey) => string): SettingsFormLabels {
  return {
    unavailable: t('unavailable'),
    readOnly: t('readOnly'),
    saveFailed: t('saveFailed'),
    save: t('save'),
    saving: t('saving'),
  }
}
