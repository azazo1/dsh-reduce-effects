/**
 * Host half: declares the volatile preference fields and hands their page to
 * the browser half. Every field is volatile, so the settings document owns the
 * value and the browser half reads it through the same entry id.
 */
import type {} from '@deepseek-ai/dsh-settings'

import type { Context, Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { CATEGORY_FIELDS, MASTER_FIELD, PLUGIN_NAME } from './settings.ts'

export {
  CATEGORY_FIELDS, DEFAULT_SETTINGS, MASTER_FIELD, PLUGIN_ID, PLUGIN_NAME,
  normalizeSettings, type CategoryField, type ReduceEffectsSettings,
} from './settings.ts'

/** Plugin module name the Loader row resolves. */
export const name = PLUGIN_NAME

/** Runtime preferences projected to the browser, one live reference per field. */
export type Config = Record<typeof MASTER_FIELD | typeof CATEGORY_FIELDS[number], Volatile<boolean>>

/** Live preference schema: the settings form's field set and its defaults (全开). */
export const Config = z.object({
  [MASTER_FIELD]: z.boolean().default(true).volatile(),
  motion: z.boolean().default(true).volatile(),
  spinnerMotion: z.boolean().default(true).volatile(),
  blur: z.boolean().default(true).volatile(),
  smoothScroll: z.boolean().default(true).volatile(),
  hoverMarquee: z.boolean().default(true).volatile(),
  decoration: z.boolean().default(true).volatile(),
  gradients: z.boolean().default(true).volatile(),
  jsMotion: z.boolean().default(true).volatile(),
})

/**
 * Register the plugin's own page as the settings surface for these fields.
 * @param ctx - Host plugin context.
 */
export function apply(ctx: Context): void {
  // The browser half ships its own page, so the schema-generated form stays off
  // for this entry; the fields remain readable and writable either way.
  ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))
  })
}
