import z from "@deepseek-ai/schemastery";
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
/**
* 总开关不代管的分类. 加载指示器与进度条表达的是 "还在跑" 这一功能信息,
* 不是装饰, 所以总开关不该把它一起收掉, 只有它自己的开关能停.
*/
const MASTER_EXEMPT_FIELD = "spinnerMotion";
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
//#region src/index.ts
/** Plugin module name the Loader row resolves. */
const name = PLUGIN_NAME;
/** Live preference schema: the settings form's field set and its defaults. */
const Config = z.object({
	[MASTER_FIELD]: z.boolean().default(false).volatile(),
	motion: z.boolean().default(false).volatile(),
	spinnerMotion: z.boolean().default(false).volatile(),
	blur: z.boolean().default(false).volatile(),
	smoothScroll: z.boolean().default(false).volatile(),
	hoverMarquee: z.boolean().default(false).volatile(),
	decoration: z.boolean().default(false).volatile(),
	gradients: z.boolean().default(false).volatile(),
	jsMotion: z.boolean().default(false).volatile()
});
/**
* Register the plugin's own page as the settings surface for these fields.
* @param ctx - Host plugin context.
*/
function apply(ctx) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
	});
}
//#endregion
export { CATEGORY_FIELDS, Config, DEFAULT_SETTINGS, MASTER_EXEMPT_FIELD, MASTER_FIELD, PLUGIN_ID, PLUGIN_NAME, apply, name, normalizeSettings };

//# sourceMappingURL=index.js.map