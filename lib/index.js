import z from "@deepseek-ai/schemastery";
//#region src/settings.ts
/**
* Shared contract of the plugin: the identity strings both halves must agree
* on, the durable preference shape, and the fallbacks for unknown data.
*
* 每个字段的语义都是 "该特效保持开启", 关掉开关才去动界面.
*/
/**
* Package name. It is also the Loader row id, the browser registration id, and
* the settings entry id the browser half reads through `ctx.configForms`.
*/
const PLUGIN_ID = "dsh-reduce-effects";
/** Plugin module name exported by the Host half and by the browser factory. */
const PLUGIN_NAME = "reduce-effects";
/** Field of the master switch: 关掉它等于把下面每个分类都关掉, 但不改动它们各自的值. */
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
/** 默认全开: 与没装插件时的 DSH 表现一致, 用户主动关掉才改变界面. */
const DEFAULT_SETTINGS = {
	master: true,
	motion: true,
	spinnerMotion: true,
	blur: true,
	smoothScroll: true,
	hoverMarquee: true,
	decoration: true,
	gradients: true,
	jsMotion: true
};
/**
* 单个字段是否保持开启.
* @param value - 设置文档里读到的原始值.
* @returns 只有显式 false 才算关闭, 缺失或类型不对都按开启处理.
*/
function isEnabled(value) {
	return value !== false;
}
/**
* Read a preference section of unknown shape into the durable settings.
* @param section - the section carried by the settings snapshot, if any.
* @returns the settings with every missing or non-boolean field enabled.
*/
function normalizeSettings(section) {
	const source = typeof section === "object" && section !== null ? section : {};
	const settings = { ...DEFAULT_SETTINGS };
	settings.master = isEnabled(source[MASTER_FIELD]);
	for (const field of CATEGORY_FIELDS) settings[field] = isEnabled(source[field]);
	return settings;
}
//#endregion
//#region src/index.ts
/** Plugin module name the Loader row resolves. */
const name = PLUGIN_NAME;
/** Live preference schema: the settings form's field set and its defaults (全开). */
const Config = z.object({
	[MASTER_FIELD]: z.boolean().default(true).volatile(),
	motion: z.boolean().default(true).volatile(),
	spinnerMotion: z.boolean().default(true).volatile(),
	blur: z.boolean().default(true).volatile(),
	smoothScroll: z.boolean().default(true).volatile(),
	hoverMarquee: z.boolean().default(true).volatile(),
	decoration: z.boolean().default(true).volatile(),
	gradients: z.boolean().default(true).volatile(),
	jsMotion: z.boolean().default(true).volatile()
});
/**
* Host half: the Config schema above is the whole host surface. The browser half
* owns the card that edits it on the Plugins page.
* @param _ctx - Host plugin context.
*/
function apply(_ctx) {}
//#endregion
export { CATEGORY_FIELDS, Config, DEFAULT_SETTINGS, MASTER_FIELD, PLUGIN_ID, PLUGIN_NAME, apply, name, normalizeSettings };

//# sourceMappingURL=index.js.map