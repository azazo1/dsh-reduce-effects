/**
 * Shared contract of the plugin: the identity strings both halves must agree
 * on, the durable preference shape, and the fallbacks for unknown data.
 */

/**
 * Package name. It is also the Loader row id, the browser registration id, and
 * the settings entry id the browser half reads through `ctx.configForms`.
 */
export const PLUGIN_ID = 'dsh-reduce-effects'

/** Plugin module name exported by the Host half and by the browser factory. */
export const PLUGIN_NAME = 'reduce-effects'

/** Preference field of the one-switch kill that forces every category below. */
export const MASTER_FIELD = 'master'

/** One boolean preference per switchable effect category. */
export const CATEGORY_FIELDS = [
  'motion',
  'spinnerMotion',
  'blur',
  'smoothScroll',
  'hoverMarquee',
  'decoration',
  'gradients',
  'jsMotion',
] as const

/**
 * 总开关不代管的分类. 加载指示器与进度条表达的是 "还在跑" 这一功能信息,
 * 不是装饰, 所以总开关不该把它一起收掉, 只有它自己的开关能停.
 */
export const MASTER_EXEMPT_FIELD = 'spinnerMotion'

/** Field name of one effect category. */
export type CategoryField = typeof CATEGORY_FIELDS[number]

/** The durable preference section as the Host schema and the page both see it. */
export interface ReduceEffectsSettings extends Record<CategoryField, boolean> {
  /** Force every category on, ignoring the per-category values. */
  master: boolean
}

/** Every switch off: the plugin changes nothing until the user asks it to. */
export const DEFAULT_SETTINGS: ReduceEffectsSettings = {
  master: false,
  motion: false,
  spinnerMotion: false,
  blur: false,
  smoothScroll: false,
  hoverMarquee: false,
  decoration: false,
  gradients: false,
  jsMotion: false,
}

/**
 * Read a preference section of unknown shape into the durable settings.
 * @param section - the section carried by the settings snapshot, if any.
 * @returns the settings with every missing or non-boolean field defaulted off.
 */
export function normalizeSettings(section: unknown): ReduceEffectsSettings {
  const source = typeof section === 'object' && section !== null
    ? section as Record<string, unknown>
    : {}
  const settings: ReduceEffectsSettings = { ...DEFAULT_SETTINGS, master: source[MASTER_FIELD] === true }
  for (const field of CATEGORY_FIELDS) settings[field] = source[field] === true
  return settings
}
