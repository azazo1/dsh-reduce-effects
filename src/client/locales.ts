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
  masterHint: '总闸. 关掉后下面每个分类都不再生效, 各分类开关保留自己的值, 但暂时不可点.',
  motion: '动画与过渡',
  motionHint: '关掉后停掉装饰性动画, 并把过渡压缩到 1 毫秒; 加载指示器与进度条由下面那一项单独控制.',
  spinnerMotion: '加载与进度动画',
  spinnerMotionHint: '关掉后进度条与加载指示器的动画也一起停, 界面看起来就像卡住. 总开关关掉时这一项同样不生效.',
  blur: '毛玻璃与背景模糊',
  blurHint: '关掉后移除菜单和浮层的背景模糊.',
  smoothScroll: '平滑滚动',
  smoothScrollHint: '关掉后滚动与跳转立即到位, 不再缓动.',
  hoverMarquee: '标题 hover 滚动',
  hoverMarqueeHint: '关掉后侧栏会话标题停在省略号处, 鼠标悬停不再逐帧横向拖动.',
  decoration: '阴影与超椭圆圆角',
  decorationHint: '关掉后移除面板阴影与文字阴影, 圆角回到普通圆弧. 面板的细描边同样由阴影绘制, 因此边界会变淡.',
  gradients: '渐变背景',
  gradientsHint: '关掉后移除渐变底纹. 渐变与图片共用同一个背景属性, 以背景图实现的图片装饰也会一并消失; 以渐变当颜料的文字退回当前文字色.',
  jsMotion: 'JS 动效',
  jsMotionHint: '关掉后让页面把系统的减少动态效果偏好报告为已开启, DSH 自带的平滑翻页与跟随滚动会走即时路径. 影响页面内所有读取该偏好的代码 (含其他插件), 已经渲染出来的界面可能需要刷新一次.',
  overridden: '已覆盖',
  reset: '恢复默认',
  readOnly: '本部署的设置为只读.',
  unavailable: '该插件当前未加载, 暂时无法配置.',
  save: '保存',
  saving: '保存中...',
  saveFailed: '本部署没有接受这些值, 已保留供你修改.',
}

export const en: LocaleDictOf<typeof LOCALE_NS> = {
  description: 'Turn off whichever DSH Web animations, blur and decorative effects you do not want, to cut browser rendering cost.',
  master: 'Every effect',
  masterHint: 'The master switch. Turning it off stops every category below; each switch keeps its own value but cannot be changed until it is back on.',
  motion: 'Animations and transitions',
  motionHint: 'Turning this off stops decorative animations and collapses transitions to one millisecond; loading spinners and progress bars follow the next switch instead.',
  spinnerMotion: 'Loading and progress animations',
  spinnerMotionHint: 'Turning this off stops spinners and progress bars too, so a stall looks like a hang. It is inactive as well while the master switch is off.',
  blur: 'Frosted backgrounds',
  blurHint: 'Turning this off removes backdrop blur from menus and floating surfaces.',
  smoothScroll: 'Smooth scrolling',
  smoothScrollHint: 'Turning this off makes scrolling and jumps land immediately instead of easing.',
  hoverMarquee: 'Hover title scroll',
  hoverMarqueeHint: 'Turning this off keeps sidebar session titles at the ellipsis instead of crawling sideways while the pointer rests on the row.',
  decoration: 'Shadows and superellipse corners',
  decorationHint: 'Turning this off removes panel and text shadows and returns corners to plain arcs. Panel hairlines are drawn by those shadows, so edges fade.',
  gradients: 'Gradient backgrounds',
  gradientsHint: 'Turning this off removes gradient washes. Gradients share the background property with artwork, so image-backed decoration disappears too; gradient-painted text falls back to its text color.',
  jsMotion: 'JS motion',
  jsMotionHint: 'Turning this off makes the page report the system reduce-motion preference as on, so DSH smooth paging and follow scrolling take their immediate path. Applies to every reader of that preference, including other plugins, and may need a refresh to reach already-rendered surfaces.',
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
