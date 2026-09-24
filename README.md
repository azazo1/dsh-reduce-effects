# dsh-reduce-effects

给 DSH Web 前端加一个设置页, 用来关闭动画, 毛玻璃, 阴影, 渐变这类特效, 减少浏览器的渲染负担.

前端特效在 DSH 里是分散的: 一部分是 CSS 动画与过渡, 一部分是菜单与浮层的毛玻璃, 还有一部分是 DSH 自带的 JS 动效 (平滑翻页, 跟随滚动), 它们只在系统开启 "减少动态效果" 时才走即时路径. 这个插件把这些分成几个分类, 每个分类一个开关, 默认全部打开 (此时界面与原生 DSH 一致), 关掉哪一项就停哪一项; 另有一个总闸可以一次停掉全部特效.

## 安装

```shell
dsh plugin --profile web add azazo1/dsh-reduce-effects
```

npm 上的包:

```shell
dsh plugin --profile web add dsh-reduce-effects
```

固定版本:

```shell
dsh plugin --profile web add azazo1/dsh-reduce-effects#v0.1.0
```

GitHub Release 同时挂不带版本号的预构建包, 安装时跳过 `allowBuilds`:

```shell
dsh plugin --profile web add https://github.com/azazo1/dsh-reduce-effects/releases/latest/download/dsh-reduce-effects.tgz
```

本地 checkout 也可以直接装目录:

```shell
dsh plugin --profile web add ./dsh-reduce-effects
```

安装后重启 `dsh web`, 浏览器里刷新一次页面.

引擎版本线跟随 `@deepseek-ai/dsh-*` 的 `0.1.7-rc.1` (peerDependencies 同号). 插件配置自 `0.1.7-rc.1` 起走 volatile Config, 设置页经 `configForms` 读写同一份数据; 浏览器半区只向模块表请求 `react` 与 `@deepseek-ai/dsh-client-ui-primitives`. 还在更早引擎线上的部署暂时装不上这个版本.

## 使用

打开 设置 > 前端特效. 页面里是一个总闸加一组分类开关, 改动立即生效, 并写入当前 profile 的 settings 文档. 所有开关默认打开, 也就是什么都不改; 下面表格说的是 "把这个开关关掉之后会失去什么".

| 开关 | 关掉之后 | 代价 |
| --- | --- | --- |
| 全部特效 | 一次停掉下面每个分类 | 分项开关保留各自的值, 但重新打开总闸前不可点 |
| 动画与过渡 | 装饰性动画停掉, 过渡压缩到 1 毫秒 | 入场动画直接落到终态 |
| 加载与进度动画 | 进度条与加载指示器的旋转, 脉冲 | 界面看起来像卡住, 看不出还在不在跑 |
| 毛玻璃与背景模糊 | 菜单, 浮层的 backdrop blur | 半透明面板后面的内容直接露出 |
| 平滑滚动 | 滚动与跳转的缓动 | 长列表跳转更生硬 |
| 标题 hover 滚动 | 侧栏会话标题悬停时的逐帧横向拖动 | 被省略的标题只能靠悬停卡片或改名看全 |
| 阴影与超椭圆圆角 | 面板阴影, 文字阴影, 超椭圆圆角 | 面板的 0.5px 描边同样由阴影绘制, 边界会变淡 |
| 渐变背景 | 渐变底纹 | 渐变与图片共用 `background-image`, 以背景图实现的图片装饰也会消失; 以渐变当颜料的文字会退回当前文字色 |
| JS 动效 | DSH 自带 JS 动效的即时路径 | 影响页面内所有读取该偏好的代码 (含其他插件) |

总闸只决定各分类生不生效, 不去改写它们自己的值: 关掉它, 各分类开关变灰并保留原值; 重新打开, 各分类立刻回到原来的状态. 所以想单独保留进度条动画, 只要不关 "加载与进度动画" 那一项即可 -- 只有这一项关掉, 卡住和运行中才会看起来一样.

## 实现

- **样式覆盖**: 组件类名是构建期哈希的, 所以覆盖规则使用通用选择器加 `!important`, 注入到一个带 `data-plugin-css` 标记的 `<style>` 里, 由插件持有并在卸载时移除.
- **过渡压时而非删除**: 时长压到 1 毫秒, 浏览器仍会触发 `transitionend`, 依赖它收尾的界面逻辑不受影响.
- **动画交给运行时筛**: CSS 没有 "按关键帧名选元素" 的写法, 所以只关一边时靠 `document.getAnimations()` 与 `animationstart` 逐个筛: 安装时扫一遍已有动画, 之后接住新出现的动画, 该停的循环动画 `cancel` 掉, 一次性入场动画 `finish` 到终态. 判据是关键帧名 (spin, progress, busy, pending, blink, dot 等视为加载反馈): 关动画与过渡时停装饰动画放行加载指示器, 关加载动画时反过来; 两者都关才改用全局的 1 毫秒动画规则.
- **JS 动效即时化**: 关掉 JS 动效开关时覆盖 `window.matchMedia`, 让 `prefers-reduced-motion` 查询回答 reduce, `no-preference` 回答 false, 其他查询原样转发; 开关打开或卸载插件时恢复原函数.
- **配置**: 字段是 volatile 的插件的 Config, 每个字段表示对应特效是否开启 (默认 true), entry id 为 `dsh-reduce-effects`, 落在 profile 的 settings 文档里, 页面通过 `ctx.configForms` 读写同一份数据.

## 已知限制

- 与系统的 "减少动态效果" 是叠加关系, 插件不修改系统设置.
- 只覆盖 Web 客户端; 桌面端窗口材质 (macOS vibrancy, Windows acrylic) 由系统与 Electron 负责.
- 关掉 "JS 动效" 会影响所有读取 `prefers-reduced-motion` 的代码, 包括其他插件; 已经渲染出来的界面可能需要刷新一次.
- DSH 前端的样式会随版本变化, 新出现的特效类别需要在本插件里补充规则.

## 开发

```shell
just install
just typecheck
just build
just test
just verify
```

- `src/index.ts` 是 Host 半区: 声明 volatile 的配置字段.
- `src/settings.ts` 是 Host 与浏览器共享的契约: 标识符, 字段名, 默认值与归一化.
- `src/client/` 是浏览器半区: 效果计划, 样式生成, 动画守卫, `matchMedia` 覆盖, 以及设置页.
- `lib/` 是构建产物, 随包发布.

## 许可

MIT
