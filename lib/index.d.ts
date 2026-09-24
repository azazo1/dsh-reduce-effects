import z from "@deepseek-ai/schemastery";
import { Context, Volatile } from "@deepseek-ai/cordis";
//#region src/settings.d.ts
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
declare const PLUGIN_ID = "dsh-reduce-effects";
/** Plugin module name exported by the Host half and by the browser factory. */
declare const PLUGIN_NAME = "reduce-effects";
/** Field of the master switch: 关掉它等于把下面每个分类都关掉, 但不改动它们各自的值. */
declare const MASTER_FIELD = "master";
/** One boolean preference per switchable effect category. */
declare const CATEGORY_FIELDS: readonly ["motion", "spinnerMotion", "textShimmer", "blur", "smoothScroll", "hoverMarquee", "decoration", "gradients", "jsMotion"];
/** Field name of one effect category. */
type CategoryField = typeof CATEGORY_FIELDS[number];
/** The durable preference section as the Host schema and the page both see it. */
interface ReduceEffectsSettings extends Record<CategoryField, boolean> {
  /** 全部特效的总开关; 关掉后各分类一律不生效, 但各自的选择原样保留. */
  master: boolean;
}
/** 默认全开: 与没装插件时的 DSH 表现一致, 用户主动关掉才改变界面. */
declare const DEFAULT_SETTINGS: ReduceEffectsSettings;
/**
 * Read a preference section of unknown shape into the durable settings.
 * @param section - the section carried by the settings snapshot, if any.
 * @returns the settings with every missing or non-boolean field enabled.
 */
declare function normalizeSettings(section: unknown): ReduceEffectsSettings;
//#endregion
//#region src/index.d.ts
/** Plugin module name the Loader row resolves. */
declare const name = "reduce-effects";
/** Runtime preferences projected to the browser, one live reference per field. */
type Config = Record<typeof MASTER_FIELD | typeof CATEGORY_FIELDS[number], Volatile<boolean>>;
/** Live preference schema: the settings form's field set and its defaults (全开). */
declare const Config: z<Schemastery.ObjectS<NoInfer<{
  master: z<boolean, boolean, "volatile-defined">;
  motion: z<boolean, boolean, "volatile-defined">;
  spinnerMotion: z<boolean, boolean, "volatile-defined">;
  textShimmer: z<boolean, boolean, "volatile-defined">;
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
  textShimmer: z<boolean, boolean, "volatile-defined">;
  blur: z<boolean, boolean, "volatile-defined">;
  smoothScroll: z<boolean, boolean, "volatile-defined">;
  hoverMarquee: z<boolean, boolean, "volatile-defined">;
  decoration: z<boolean, boolean, "volatile-defined">;
  gradients: z<boolean, boolean, "volatile-defined">;
  jsMotion: z<boolean, boolean, "volatile-defined">;
}>>, "plain">;
/**
 * Host half: the Config schema above is the whole host surface. The browser half
 * owns the card that edits it on the Plugins page.
 * @param _ctx - Host plugin context.
 */
declare function apply(_ctx: Context): void;
//#endregion
export { CATEGORY_FIELDS, type CategoryField, Config, DEFAULT_SETTINGS, MASTER_FIELD, PLUGIN_ID, PLUGIN_NAME, type ReduceEffectsSettings, apply, name, normalizeSettings };
//# sourceMappingURL=index.d.ts.map