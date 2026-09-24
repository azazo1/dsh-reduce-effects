(function() {
	//#region src/settings.ts
	/**
	* Shared contract of the plugin: the identity strings both halves must agree
	* on, the durable preference shape, and the fallbacks for unknown data.
	*/
	/**
	* Package name. It is also the Loader row id, the browser registration id, and
	* the settings entry id the browser half reads through `ctx.configForms`.
	*/
	const PLUGIN_ID = "dsh-reduce-effects";
	/** Plugin module name exported by the Host half and by the browser factory. */
	const PLUGIN_NAME = "reduce-effects";
	/** Preference field of the one-switch kill that forces every category below. */
	const MASTER_FIELD = "master";
	/** One boolean preference per switchable effect category. */
	const CATEGORY_FIELDS = [
		"motion",
		"spinnerMotion",
		"blur",
		"smoothScroll",
		"hoverMarquee",
		"decoration",
		"gradients",
		"jsMotion"
	];
	/** Every switch off: the plugin changes nothing until the user asks it to. */
	const DEFAULT_SETTINGS = {
		master: false,
		motion: false,
		spinnerMotion: false,
		blur: false,
		smoothScroll: false,
		hoverMarquee: false,
		decoration: false,
		gradients: false,
		jsMotion: false
	};
	/**
	* Read a preference section of unknown shape into the durable settings.
	* @param section - the section carried by the settings snapshot, if any.
	* @returns the settings with every missing or non-boolean field defaulted off.
	*/
	function normalizeSettings(section) {
		const source = typeof section === "object" && section !== null ? section : {};
		const settings = {
			...DEFAULT_SETTINGS,
			master: source[MASTER_FIELD] === true
		};
		for (const field of CATEGORY_FIELDS) settings[field] = source[field] === true;
		return settings;
	}
	//#endregion
	//#region src/client/dom-style.ts
	/**
	* One owned `<style>` element, addressed by its `data-plugin-css` marker so a
	* repeated call updates the existing sheet instead of stacking another one.
	*/
	/**
	* Insert or update the stylesheet carrying one marker.
	* @param doc - document owning the head.
	* @param mark - value of the `data-plugin-css` marker.
	* @param css - stylesheet text to publish.
	* @returns the managed element, or undefined when no head is available yet.
	*/
	function upsertStyle(doc, mark, css) {
		const head = doc.head;
		if (head === null) return void 0;
		const existing = doc.querySelector(`style[data-plugin-css="${mark}"]`);
		const style = existing ?? doc.createElement("style");
		if (existing === null) {
			style.dataset["pluginCss"] = mark;
			head.appendChild(style);
		}
		if (style.textContent !== css) style.textContent = css;
		return style;
	}
	/**
	* Remove the stylesheet carrying one marker.
	* @param doc - document owning the head.
	* @param mark - value of the `data-plugin-css` marker.
	*/
	function removeStyle(doc, mark) {
		doc.querySelector(`style[data-plugin-css="${mark}"]`)?.remove();
	}
	//#endregion
	//#region src/client/effect-css.ts
	/**
	* Durations collapse to one millisecond instead of `none`: the browser still
	* fires `transitionend`, so components that settle on those events keep working.
	*/
	const TRANSITION_RULES = `*, *::before, *::after {
  transition-duration: 1ms !important;
  transition-delay: 0s !important;
}`;
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
}`;
	/** Backdrop filters are the frosted menu and overlay material. */
	const BLUR_RULES = `*, *::before, *::after {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}`;
	/** Native smooth scrolling, including programmatic `scrollIntoView` easing. */
	const SMOOTH_SCROLL_RULES = `*, *::before, *::after {
  scroll-behavior: auto !important;
}`;
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
}`;
	/** Shadows paint panel strokes as well, so surfaces lose their hairline edge. */
	const DECORATION_RULES = `*, *::before, *::after {
  box-shadow: none !important;
  text-shadow: none !important;
  corner-shape: round !important;
}`;
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
}`;
	/**
	* Build the stylesheet for one plan.
	* @param plan - the effective plan.
	* @returns the stylesheet text, or an empty string when nothing applies.
	*/
	function effectCss(plan) {
		const blocks = [];
		if (plan.motion) blocks.push(TRANSITION_RULES);
		if (plan.motion && plan.spinnerMotion) blocks.push(ANIMATION_RULES);
		if (plan.blur) blocks.push(BLUR_RULES);
		if (plan.smoothScroll) blocks.push(SMOOTH_SCROLL_RULES);
		if (plan.hoverMarquee) blocks.push(HOVER_TITLE_RULES);
		if (plan.decoration) blocks.push(DECORATION_RULES);
		if (plan.gradients) blocks.push(GRADIENT_RULES);
		return blocks.join("\n\n");
	}
	//#endregion
	//#region src/client/media-override.ts
	/**
	* Answers `prefers-reduced-motion` queries as if the system asked for reduced
	* motion, so page code — the shell's own smooth-scrolling and paging branches,
	* and any other plugin's — takes its immediate path. Only that one feature is
	* touched; every other query still reaches the browser.
	*/
	/** Queries this override answers. */
	const REDUCED_MOTION = /prefers-reduced-motion/i;
	/** The explicit opposite form, which must stay false while reduce is forced. */
	const NO_PREFERENCE = /no-preference/i;
	/**
	* Decide the synthesized answer for one media query.
	* @param query - the raw query string handed to `matchMedia`.
	* @returns true or false when the query asks about reduced motion, otherwise
	* undefined so the caller defers to the browser.
	*/
	function reducedMotionVerdict(query) {
		if (!REDUCED_MOTION.test(query)) return void 0;
		return NO_PREFERENCE.test(query) ? false : true;
	}
	/** A media query list that never changes and never notifies. */
	function staticQueryList(media, matches) {
		return {
			media,
			matches,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false
		};
	}
	/**
	* Install the override on one window.
	* @param win - window whose `matchMedia` is replaced.
	* @returns the disposer restoring the original function; it is a no-op when
	* someone else replaced `matchMedia` after this override.
	*/
	function installReducedMotionOverride(win) {
		const native = win.matchMedia;
		if (typeof native !== "function") return () => {};
		const patched = function patchedMatchMedia(query) {
			const verdict = reducedMotionVerdict(query);
			if (verdict === void 0) return native.call(win, query);
			return staticQueryList(query, verdict);
		};
		win.matchMedia = patched;
		return () => {
			if (win.matchMedia === patched) win.matchMedia = native;
		};
	}
	//#endregion
	//#region src/client/loading-animation.ts
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
		"spin",
		"rotate",
		"progress",
		"loading",
		"loader",
		"busy",
		"pending",
		"blink",
		"dot"
	];
	/**
	* 关键帧名是否属于加载反馈.
	* @param name - `Animation.animationName`.
	* @returns true 表示这个动画应当继续播放.
	*/
	function isLoadingAnimation(name) {
		const lower = name.toLowerCase();
		return LOADING_HINTS.some((hint) => lower.includes(hint));
	}
	//#endregion
	//#region src/client/motion-guard.ts
	/**
	* 运行时收掉装饰性动画, 放行加载与进度指示器.
	*
	* 安装时先扫一遍文档里已有的动画, 之后用 `animationstart` 接住新出现的动画:
	* 无限循环的装饰动画直接 cancel (元素回到基础样式), 一次性的入场动画 finish
	* 到终态 (元素停在动画结束的样子). 判据见 `loading-animation.ts`.
	*/
	/**
	* 取一个动画的关键帧名.
	* @param animation - 待判定的动画.
	* @returns 关键帧名; 过渡 (CSSTransition) 没有名字, 返回 undefined.
	*/
	function keyframeNameOf(animation) {
		const name = animation.animationName;
		return typeof name === "string" && name !== "" ? name : void 0;
	}
	/**
	* 结束一个装饰动画.
	* @param animation - 待结束的动画.
	*/
	function settle(animation) {
		if (animation.effect?.getTiming().iterations === Infinity) animation.cancel();
		else animation.finish();
	}
	/**
	* 对一批动画执行策略: 只有加载反馈类留下.
	* @param animations - 待筛的动画, 通常是 `getAnimations()` 的结果.
	*/
	function guardAnimations(animations) {
		for (const animation of animations) {
			const name = keyframeNameOf(animation);
			if (name === void 0 || isLoadingAnimation(name)) continue;
			try {
				settle(animation);
			} catch {}
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
	function animationsOf(host) {
		const source = host;
		return typeof source?.getAnimations === "function" ? source.getAnimations() : [];
	}
	/**
	* 在文档上安装筛选器, 并立即扫一遍已有动画.
	* @param doc - 目标文档.
	* @returns 卸载函数; 已经取消的动画不会因此恢复, 需要等组件重新渲染.
	*/
	function installMotionGuard(doc) {
		const onAnimationStart = (event) => {
			guardAnimations(animationsOf(event.target));
		};
		guardAnimations(animationsOf(doc));
		doc.addEventListener("animationstart", onAnimationStart, true);
		return () => {
			doc.removeEventListener("animationstart", onAnimationStart, true);
		};
	}
	//#endregion
	//#region src/client/effect-controller.ts
	/**
	* Keeps the page in sync with the effective plan: one owned stylesheet plus the
	* optional media-query override, both applied idempotently.
	*/
	/** Applies one plan to the page and follows later plans. */
	var EffectsController = class {
		target;
		restoreMatchMedia;
		restoreMotionGuard;
		/** @param target - the document, window and style marker this controller owns. */
		constructor(target) {
			this.target = target;
		}
		/**
		* Apply a plan. Repeated calls are idempotent, so a settings snapshot that
		* did not change costs one string comparison.
		*
		* 样式表负责过渡与 "连加载动画一起停" 这两档; 只停装饰动画时, 动画的取舍
		* 交给运行时筛选, 因为 CSS 没法按关键帧名区分加载指示器.
		* @param plan - the effective plan.
		*/
		apply(plan) {
			const css = effectCss(plan);
			if (css === "") removeStyle(this.target.doc, this.target.styleMark);
			else upsertStyle(this.target.doc, this.target.styleMark, css);
			if (plan.motion && !plan.spinnerMotion) this.restoreMotionGuard ??= installMotionGuard(this.target.doc);
			else {
				this.restoreMotionGuard?.();
				this.restoreMotionGuard = void 0;
			}
			if (plan.jsMotion) this.restoreMatchMedia ??= installReducedMotionOverride(this.target.win);
			else {
				this.restoreMatchMedia?.();
				this.restoreMatchMedia = void 0;
			}
		}
		/** Drop the stylesheet and the overrides; the page returns to its own behavior. */
		dispose() {
			removeStyle(this.target.doc, this.target.styleMark);
			this.restoreMotionGuard?.();
			this.restoreMotionGuard = void 0;
			this.restoreMatchMedia?.();
			this.restoreMatchMedia = void 0;
		}
	};
	//#endregion
	//#region src/client/effect-plan.ts
	/**
	* Fold the stored preferences into the effective plan. The master switch wins
	* over every category, which is what makes it a single one-click kill.
	* @param settings - normalized preference section.
	* @returns the effective decision per category.
	*
	* 总开关只被 settings 里标记为豁免的分类挡下一次: 加载指示器的动画属于功能反馈.
	*/
	function resolveEffectPlan(settings) {
		const forced = settings.master;
		return {
			motion: forced || settings.motion,
			spinnerMotion: settings.spinnerMotion,
			blur: forced || settings.blur,
			smoothScroll: forced || settings.smoothScroll,
			hoverMarquee: forced || settings.hoverMarquee,
			decoration: forced || settings.decoration,
			gradients: forced || settings.gradients,
			jsMotion: forced || settings.jsMotion
		};
	}
	//#endregion
	//#region src/client/locales.ts
	/** Dictionary namespace owned by this plugin's settings page. */
	const LOCALE_NS = "settings.reduceEffects";
	const zh = {
		nav: "前端特效",
		title: "前端特效",
		intro: "关闭 DSH Web 前端的动画, 模糊与装饰效果, 减少浏览器渲染负担. 开关立即生效, 并保存在当前 profile.",
		cardTitle: "特效分类",
		master: "关闭全部特效",
		masterHint: "一键打开下面全部分类, 包括 JS 动效. 开启时下面各项被强制打开, 各自的开关暂时不生效; 加载与进度动画除外, 它由单独开关控制.",
		motion: "动画与过渡",
		motionHint: "停止装饰性动画, 并把过渡压缩到 1 毫秒. 加载指示器与进度条默认继续转动, 要连它们一起停见下一项.",
		spinnerMotion: "加载与进度动画",
		spinnerMotionHint: "打开后, 加载指示器与进度条的动画也一起停掉, 界面看起来就像卡住; 默认关闭, 总开关也不代管这一项.",
		blur: "毛玻璃与背景模糊",
		blurHint: "移除菜单和浮层的背景模糊.",
		smoothScroll: "平滑滚动",
		smoothScrollHint: "滚动与跳转立即到位, 不再缓动.",
		hoverMarquee: "标题 hover 滚动",
		hoverMarqueeHint: "侧栏会话标题在鼠标悬停时会逐帧横向拖动, 好让被省略的标题看全; 打开后标题停在省略号处, 悬停不再滚动.",
		decoration: "阴影与超椭圆圆角",
		decorationHint: "移除面板阴影与文字阴影, 圆角回到普通圆弧. 面板的细描边同样由阴影绘制, 因此边界会变淡.",
		gradients: "渐变背景",
		gradientsHint: "移除渐变底纹. 渐变与图片共用同一个背景属性, 以背景图实现的图片装饰也会一并消失.",
		jsMotion: "JS 动效即时化",
		jsMotionHint: "让页面把系统的减少动态效果偏好报告为已开启, DSH 自带的平滑翻页与跟随滚动会走即时路径. 影响页面内所有读取该偏好的代码 (含其他插件), 已经渲染出来的界面可能需要刷新一次.",
		masterNotice: "总开关已开启, 下面各分类被强制打开.",
		notWritable: "当前连接不允许保存设置 (进程内模式), 开关不可用.",
		loading: "正在读取设置...",
		writeFailed: "保存失败, 界面已恢复为服务端的值."
	};
	const en = {
		nav: "UI effects",
		title: "UI effects",
		intro: "Turn off DSH Web animations, blur and decorative effects to cut browser rendering cost. Switches apply immediately and are saved in this profile.",
		cardTitle: "Effect categories",
		master: "Turn off every effect",
		masterHint: "Forces every category below, including JS motion. While it is on, the individual switches have no effect; loading and progress animations are the exception and keep their own switch.",
		motion: "Animations and transitions",
		motionHint: "Stops decorative animations and collapses transitions to one millisecond. Loading spinners and progress bars keep moving unless the next switch is on.",
		spinnerMotion: "Loading and progress animations",
		spinnerMotionHint: "Turning this on stops spinners and progress bars too, so a stall looks like a hang. It is off by default, and the master switch leaves it alone.",
		blur: "Frosted backgrounds",
		blurHint: "Removes backdrop blur from menus and floating surfaces.",
		smoothScroll: "Smooth scrolling",
		smoothScrollHint: "Scrolling and jumps land immediately instead of easing.",
		hoverMarquee: "Hover title scroll",
		hoverMarqueeHint: "Sidebar session titles crawl sideways while the pointer rests on the row so a clipped title can be read in full; turning this on keeps them at the ellipsis instead.",
		decoration: "Shadows and superellipse corners",
		decorationHint: "Removes panel and text shadows and returns corners to plain arcs. Panel hairlines are drawn by those shadows, so edges fade.",
		gradients: "Gradient backgrounds",
		gradientsHint: "Removes gradient washes. Gradients share the background property with artwork, so image-backed decoration disappears too.",
		jsMotion: "Immediate JS motion",
		jsMotionHint: "Makes the page report the system reduce-motion preference as on, so DSH smooth paging and follow scrolling take their immediate path. Applies to every reader of that preference, including other plugins, and may need a refresh to reach already-rendered surfaces.",
		masterNotice: "The master switch is on, so every category below is forced on.",
		notWritable: "This connection keeps preferences process-local, so the switches are unavailable.",
		loading: "Reading preferences...",
		writeFailed: "The write failed; the interface fell back to the served value."
	};
	//#endregion
	//#region src/client/page-css.ts
	/**
	* Stylesheet of the settings page. Class names carry the package prefix because
	* this sheet is global by construction, not a CSS module.
	*/
	/** `data-plugin-css` marker of the page stylesheet. */
	const PAGE_STYLE_MARK = "dsh-reduce-effects/page";
	/** Page styles, sized to the DSH settings surface conventions. */
	const PAGE_CSS = `.dsh-reduce-effects-page {
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dsh-reduce-effects-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}

.dsh-reduce-effects-intro {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-tertiary);
}

.dsh-reduce-effects-card {
  background: var(--dsw-alias-bg-layer-3);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  padding: 0 16px;
}

.dsh-reduce-effects-cardTitle {
  padding: 12px 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}

.dsh-reduce-effects-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--dsw-alias-border-l2);
}

.dsh-reduce-effects-rowText {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 auto;
  min-width: 0;
}

.dsh-reduce-effects-rowLabel {
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
}

.dsh-reduce-effects-rowHint {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
}

.dsh-reduce-effects-switch {
  flex: 0 0 auto;
}

.dsh-reduce-effects-note {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
}

@media (max-width: 560px) {
  .dsh-reduce-effects-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
`;
	//#endregion
	//#region src/client/page.ts
	/**
	* Build the page component.
	* @param deps - React, the switch control, and the settings form.
	* @returns the component the `settings.section` entry renders.
	*/
	function createReduceEffectsPage(deps) {
		const { React, Switch, form } = deps;
		upsertStyle(document, PAGE_STYLE_MARK, PAGE_CSS);
		return function ReduceEffectsPage(props) {
			const { t } = props;
			const snapshot = React.useSyncExternalStore((onChange) => form.subscribe(onChange), () => form.getSnapshot());
			const settings = normalizeSettings(snapshot.value);
			const masterOn = settings[MASTER_FIELD];
			const [pending, setPending] = React.useState(false);
			const [failed, setFailed] = React.useState(false);
			const write = (field, next) => {
				setPending(true);
				setFailed(false);
				form.set(field, next).then((accepted) => {
					setFailed(!accepted);
				}, () => {
					setFailed(true);
				}).finally(() => {
					setPending(false);
				});
			};
			const locked = !snapshot.writable || pending;
			const row = (key, labelKey, hintKey, checked, disabled, title) => React.createElement("div", {
				className: "dsh-reduce-effects-row",
				key
			}, React.createElement("div", { className: "dsh-reduce-effects-rowText" }, React.createElement("div", { className: "dsh-reduce-effects-rowLabel" }, t(labelKey)), React.createElement("div", { className: "dsh-reduce-effects-rowHint" }, t(hintKey))), React.createElement(Switch, {
				checked,
				disabled,
				label: t(labelKey),
				title,
				className: "dsh-reduce-effects-switch",
				onChange: (next) => {
					write(key, next);
				}
			}));
			const rows = [row(MASTER_FIELD, "master", "masterHint", masterOn, locked, void 0), ...CATEGORY_FIELDS.map((field) => {
				const forced = masterOn && field !== "spinnerMotion";
				return row(field, field, `${field}Hint`, settings[field], locked || forced, forced ? t("masterNotice") : void 0);
			})];
			const statusNote = snapshot.status === "loading" ? t("loading") : !snapshot.writable ? t("notWritable") : failed ? t("writeFailed") : void 0;
			return React.createElement("section", { className: "dsh-reduce-effects-page" }, React.createElement("h2", { className: "dsh-reduce-effects-title" }, t("title")), React.createElement("p", { className: "dsh-reduce-effects-intro" }, t("intro")), React.createElement("div", { className: "dsh-reduce-effects-card" }, React.createElement("div", { className: "dsh-reduce-effects-cardTitle" }, t("cardTitle")), ...rows), masterOn ? React.createElement("p", { className: "dsh-reduce-effects-note" }, t("masterNotice")) : null, statusNote === void 0 ? null : React.createElement("p", { className: "dsh-reduce-effects-note" }, statusNote));
		};
	}
	//#endregion
	//#region src/client/index.ts
	/** `data-plugin-css` marker of the injected effect rules. */
	const EFFECT_STYLE_MARK = `${PLUGIN_ID}/effects`;
	const loader = window.__ModuleLoader__;
	if (loader === void 0) throw new Error(`${PLUGIN_ID}: window.__ModuleLoader__ is missing; the browser half must load as a DSH client bundle`);
	loader.load({
		id: PLUGIN_ID,
		factory: (require) => {
			const React = require("react");
			const { Switch } = require("@deepseek-ai/dsh-client-ui-primitives");
			return {
				name: PLUGIN_NAME,
				inject: [
					"slots",
					"locale",
					"configForms"
				],
				apply(ctx) {
					const form = ctx.configForms.get(PLUGIN_ID);
					const controller = new EffectsController({
						doc: document,
						win: window,
						styleMark: EFFECT_STYLE_MARK
					});
					ctx.effect(() => {
						const sync = () => {
							controller.apply(resolveEffectPlan(normalizeSettings(form.getSnapshot().value)));
						};
						const stop = form.subscribe(sync);
						sync();
						return () => {
							stop();
							controller.dispose();
						};
					}, `${PLUGIN_ID}: effect runtime`);
					const Page = createReduceEffectsPage({
						React,
						Switch,
						form
					});
					ctx.effect(() => ctx.locale.register(LOCALE_NS, {
						zh,
						en
					}), `${PLUGIN_ID}: dictionaries`);
					const t = ctx.locale.bind(LOCALE_NS);
					ctx.effect(() => ctx.configForms.whileServed([PLUGIN_ID], () => ctx.slots.inject("settings.section", () => ctx.slots.register({
						name: "settings.section",
						id: PLUGIN_ID,
						order: 200,
						label: () => t("nav"),
						locale: LOCALE_NS
					}, Page))), `${PLUGIN_ID}: settings page`);
				}
			};
		}
	});
	//#endregion
})();

//# sourceMappingURL=client.js.map