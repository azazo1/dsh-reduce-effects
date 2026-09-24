import z from "@deepseek-ai/schemastery";
import { Context, Volatile } from "@deepseek-ai/cordis";
//#region src/settings.d.ts
/**
 * Shared contract of the plugin: the identity strings both halves must agree
 * on, the durable preference shape, and the fallbacks for unknown data.
 */
/**
 * Package name. It is also the Loader row id, the browser registration id, and
 * the settings entry id the browser half reads through `ctx.configForms`.
 */
declare const PLUGIN_ID = "dsh-reduce-effects";
/** Plugin module name exported by the Host half and by the browser factory. */
declare const PLUGIN_NAME = "reduce-effects";
/** Preference field of the one-switch kill that forces every category below. */
declare const MASTER_FIELD = "master";
/** One boolean preference per switchable effect category. */
declare const CATEGORY_FIELDS: readonly ["motion", "spinnerMotion", "blur", "smoothScroll", "hoverMarquee", "decoration", "gradients", "jsMotion"];
/**
 * 总开关不代管的分类. 加载指示器与进度条表达的是 "还在跑" 这一功能信息,
 * 不是装饰, 所以总开关不该把它一起收掉, 只有它自己的开关能停.
 */
declare const MASTER_EXEMPT_FIELD = "spinnerMotion";
/** Field name of one effect category. */
type CategoryField = typeof CATEGORY_FIELDS[number];
/** The durable preference section as the Host schema and the page both see it. */
interface ReduceEffectsSettings extends Record<CategoryField, boolean> {
  /** Force every category on, ignoring the per-category values. */
  master: boolean;
}
/** Every switch off: the plugin changes nothing until the user asks it to. */
declare const DEFAULT_SETTINGS: ReduceEffectsSettings;
/**
 * Read a preference section of unknown shape into the durable settings.
 * @param section - the section carried by the settings snapshot, if any.
 * @returns the settings with every missing or non-boolean field defaulted off.
 */
declare function normalizeSettings(section: unknown): ReduceEffectsSettings;
//#endregion
//#region src/index.d.ts
/** Plugin module name the Loader row resolves. */
declare const name = "reduce-effects";
/** Runtime preferences projected to the browser, one live reference per field. */
type Config = Record<typeof MASTER_FIELD | typeof CATEGORY_FIELDS[number], Volatile<boolean>>;
/** Live preference schema: the settings form's field set and its defaults. */
declare const Config: z<Schemastery.ObjectS<NoInfer<{
  master: z<boolean, boolean, "volatile-defined">;
  motion: z<boolean, boolean, "volatile-defined">;
  spinnerMotion: z<boolean, boolean, "volatile-defined">;
  blur: z<boolean, boolean, "volatile-defined">;
  smoothScroll: z<boolean, boolean, "volatile-defined">;
  hoverMarquee: z<boolean, boolean, "volatile-defined">;
  decoration: z<boolean, boolean, "volatile-defined">;
  gradients: z<boolean, boolean, "volatile-defined">;
  jsMotion: z<boolean, boolean, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
  master: z<boolean, boolean, "volatile-defined">;
  motion: z<boolean, boolean, "volatile-defined">;
  spinnerMotion: z<boolean, boolean, "volatile-defined">;
  blur: z<boolean, boolean, "volatile-defined">;
  smoothScroll: z<boolean, boolean, "volatile-defined">;
  hoverMarquee: z<boolean, boolean, "volatile-defined">;
  decoration: z<boolean, boolean, "volatile-defined">;
  gradients: z<boolean, boolean, "volatile-defined">;
  jsMotion: z<boolean, boolean, "volatile-defined">;
}>>, "plain">;
/**
 * Register the plugin's own page as the settings surface for these fields.
 * @param ctx - Host plugin context.
 */
declare function apply(ctx: Context): void;
//#endregion
export { CATEGORY_FIELDS, type CategoryField, Config, DEFAULT_SETTINGS, MASTER_EXEMPT_FIELD, MASTER_FIELD, PLUGIN_ID, PLUGIN_NAME, type ReduceEffectsSettings, apply, name, normalizeSettings };
//# sourceMappingURL=index.d.ts.map