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
export const PLUGIN_ID = 'dsh-reduce-effects'

/** Plugin module name exported by the Host half and by the browser factory. */
export const PLUGIN_NAME = 'reduce-effects'

/** Field of the master switch: 关掉它等于把下面每个分类都关掉, 但不改动它们各自的值. */
export const MASTER_FIELD = 'master'

/** One boolean preference per switchable effect category. */
export const CATEGORY_FIELDS = [
  'motion',
  'spinnerMotion',
  'textShimmer',
  'blur',
  'smoothScroll',
  'hoverMarquee',
  'decoration',
  'gradients',
  'jsMotion',
] as const

/** Field name of one effect category. */
export type CategoryField = typeof CATEGORY_FIELDS[number]

/** The durable preference section as the Host schema and the page both see it. */
export interface ReduceEffectsSettings extends Record<CategoryField, boolean> {
  /** 全部特效的总开关; 关掉后各分类一律不生效, 但各自的选择原样保留. */
  master: boolean
}

/** 默认全开: 与没装插件时的 DSH 表现一致, 用户主动关掉才改变界面. */
export const DEFAULT_SETTINGS: ReduceEffectsSettings = {
  master: true,
  motion: true,
  spinnerMotion: true,
  textShimmer: true,
  blur: true,
  smoothScroll: true,
  hoverMarquee: true,
  decoration: true,
  gradients: true,
  jsMotion: true,
}

/**
 * 单个字段是否保持开启.
 * @param value - 设置文档里读到的原始值.
 * @returns 只有显式 false 才算关闭, 缺失或类型不对都按开启处理.
 */
function isEnabled(value: unknown): boolean {
  return value !== false
}

/**
 * Read a preference section of unknown shape into the durable settings.
 * @param section - the section carried by the settings snapshot, if any.
 * @returns the settings with every missing or non-boolean field enabled.
 */
export function normalizeSettings(section: unknown): ReduceEffectsSettings {
  const source = typeof section === 'object' && section !== null
    ? section as Record<string, unknown>
    : {}
  const settings: ReduceEffectsSettings = { ...DEFAULT_SETTINGS }
  settings.master = isEnabled(source[MASTER_FIELD])
  for (const field of CATEGORY_FIELDS) settings[field] = isEnabled(source[field])
  return settings
}
