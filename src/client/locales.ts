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
  intro: '关闭 DSH Web 前端的动画, 模糊与装饰效果, 减少浏览器渲染负担. 开关立即生效, 并保存在当前 profile.',
  cardTitle: '特效分类',
  master: '关闭全部特效',
  masterHint: '一键打开下面全部分类, 包括 JS 动效. 开启时下面各项被强制打开, 各自的开关暂时不生效; 加载与进度动画除外, 它由单独开关控制.',
  motion: '动画与过渡',
  motionHint: '停止装饰性动画, 并把过渡压缩到 1 毫秒. 加载指示器与进度条默认继续转动, 要连它们一起停见下一项.',
  spinnerMotion: '加载与进度动画',
  spinnerMotionHint: '打开后, 加载指示器与进度条的动画也一起停掉, 界面看起来就像卡住; 默认关闭, 总开关也不代管这一项.',
  blur: '毛玻璃与背景模糊',
  blurHint: '移除菜单和浮层的背景模糊.',
  smoothScroll: '平滑滚动',
  smoothScrollHint: '滚动与跳转立即到位, 不再缓动.',
  hoverMarquee: '标题 hover 滚动',
  hoverMarqueeHint: '侧栏会话标题在鼠标悬停时会逐帧横向拖动, 好让被省略的标题看全; 打开后标题停在省略号处, 悬停不再滚动.',
  decoration: '阴影与超椭圆圆角',
  decorationHint: '移除面板阴影与文字阴影, 圆角回到普通圆弧. 面板的细描边同样由阴影绘制, 因此边界会变淡.',
  gradients: '渐变背景',
  gradientsHint: '移除渐变底纹. 渐变与图片共用同一个背景属性, 以背景图实现的图片装饰也会一并消失.',
  jsMotion: 'JS 动效即时化',
  jsMotionHint: '让页面把系统的减少动态效果偏好报告为已开启, DSH 自带的平滑翻页与跟随滚动会走即时路径. 影响页面内所有读取该偏好的代码 (含其他插件), 已经渲染出来的界面可能需要刷新一次.',
  masterNotice: '总开关已开启, 下面各分类被强制打开.',
  notWritable: '当前连接不允许保存设置 (进程内模式), 开关不可用.',
  loading: '正在读取设置...',
  writeFailed: '保存失败, 界面已恢复为服务端的值.',
}

export const en: LocaleDictOf<typeof LOCALE_NS> = {
  nav: 'UI effects',
  title: 'UI effects',
  intro: 'Turn off DSH Web animations, blur and decorative effects to cut browser rendering cost. Switches apply immediately and are saved in this profile.',
  cardTitle: 'Effect categories',
  master: 'Turn off every effect',
  masterHint: 'Forces every category below, including JS motion. While it is on, the individual switches have no effect; loading and progress animations are the exception and keep their own switch.',
  motion: 'Animations and transitions',
  motionHint: 'Stops decorative animations and collapses transitions to one millisecond. Loading spinners and progress bars keep moving unless the next switch is on.',
  spinnerMotion: 'Loading and progress animations',
  spinnerMotionHint: 'Turning this on stops spinners and progress bars too, so a stall looks like a hang. It is off by default, and the master switch leaves it alone.',
  blur: 'Frosted backgrounds',
  blurHint: 'Removes backdrop blur from menus and floating surfaces.',
  smoothScroll: 'Smooth scrolling',
  smoothScrollHint: 'Scrolling and jumps land immediately instead of easing.',
  hoverMarquee: 'Hover title scroll',
  hoverMarqueeHint: 'Sidebar session titles crawl sideways while the pointer rests on the row so a clipped title can be read in full; turning this on keeps them at the ellipsis instead.',
  decoration: 'Shadows and superellipse corners',
  decorationHint: 'Removes panel and text shadows and returns corners to plain arcs. Panel hairlines are drawn by those shadows, so edges fade.',
  gradients: 'Gradient backgrounds',
  gradientsHint: 'Removes gradient washes. Gradients share the background property with artwork, so image-backed decoration disappears too.',
  jsMotion: 'Immediate JS motion',
  jsMotionHint: 'Makes the page report the system reduce-motion preference as on, so DSH smooth paging and follow scrolling take their immediate path. Applies to every reader of that preference, including other plugins, and may need a refresh to reach already-rendered surfaces.',
  masterNotice: 'The master switch is on, so every category below is forced on.',
  notWritable: 'This connection keeps preferences process-local, so the switches are unavailable.',
  loading: 'Reading preferences...',
  writeFailed: 'The write failed; the interface fell back to the served value.',
}
