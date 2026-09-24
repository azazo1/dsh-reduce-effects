/** Copy of the effect switches page, in both shipped languages. */

import type { LocaleDictOf } from '@deepseek-ai/dsh-client-ui-slots'

/** Dictionary namespace owned by this plugin's settings page. */
export const LOCALE_NS = 'settings.reduceEffects'

/** Every key this plugin's page resolves. */
export type ReduceEffectsKey =
  | 'nav'
  | 'title'
  | 'intro'
  | 'cardTitle'
  | 'master'
  | 'masterHint'
  | 'motion'
  | 'motionHint'
  | 'spinnerMotion'
  | 'spinnerMotionHint'
  | 'blur'
  | 'blurHint'
  | 'smoothScroll'
  | 'smoothScrollHint'
  | 'hoverMarquee'
  | 'hoverMarqueeHint'
  | 'decoration'
  | 'decorationHint'
  | 'gradients'
  | 'gradientsHint'
  | 'jsMotion'
  | 'jsMotionHint'
  | 'masterNotice'
  | 'notWritable'
  | 'loading'
  | 'writeFailed'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Copy of the frontend effect switches page. */
    'settings.reduceEffects': ReduceEffectsKey
  }
}

export const zh: LocaleDictOf<typeof LOCALE_NS> = {
  nav: '前端特效',
  title: '前端特效',
  intro: '按需关闭 DSH Web 前端的动画, 模糊与装饰效果, 减少浏览器渲染负担. 开关默认全开, 关掉哪一项就停哪一项, 改动立即生效并保存在当前 profile.',
  cardTitle: '特效分类',
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
  masterNotice: '总开关已关闭, 下面各分类当前都不生效; 各自的开关保留原值, 重新打开总开关即可恢复.',
  notWritable: '当前连接不允许保存设置 (进程内模式), 开关不可用.',
  loading: '正在读取设置...',
  writeFailed: '保存失败, 界面已恢复为服务端的值.',
}

export const en: LocaleDictOf<typeof LOCALE_NS> = {
  nav: 'UI effects',
  title: 'UI effects',
  intro: 'Turn off whichever DSH Web animations, blur and decorative effects you do not want, to cut browser rendering cost. Every switch starts on; turning one off disables that effect right away, and the choice is saved in this profile.',
  cardTitle: 'Effect categories',
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
  masterNotice: 'The master switch is off, so no category below applies right now. Each switch keeps its own value for when it is turned back on.',
  notWritable: 'This connection keeps preferences process-local, so the switches are unavailable.',
  loading: 'Reading preferences...',
  writeFailed: 'The write failed; the interface fell back to the served value.',
}
