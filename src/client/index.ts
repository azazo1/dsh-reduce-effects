/**
 * Browser half. The bundle registers itself with the client module loader, then
 * keeps the page in sync with the stored preferences and contributes the
 * switches page to Web Settings.
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: merges ctx.slots, ctx.configForms and the `settings.section` entry.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: merges ctx.locale.
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: merges the SlotRegistry service (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { normalizeSettings, PLUGIN_ID, PLUGIN_NAME, type ReduceEffectsSettings } from '../settings.ts'
import { EffectsController } from './effect-controller.ts'
import { resolveEffectPlan } from './effect-plan.ts'
import { en, LOCALE_NS, zh } from './locales.ts'
import { createReduceEffectsPage, type SwitchComponent } from './page.ts'

/** `data-plugin-css` marker of the injected effect rules. */
const EFFECT_STYLE_MARK = `${PLUGIN_ID}/effects`

/** One bundle factory registration handed to the page-global loader facade. */
interface ClientBundleRegistration {
  /** Package name; must equal {@link PLUGIN_ID}. */
  id: string
  /** Closure holding the bundle body, resolved against the loader module table. */
  factory: (require: (specifier: string) => unknown) => Record<string, unknown>
}

declare global {
  interface Window {
    /** Page-global registration facade installed by the Web shell. */
    __ModuleLoader__?: { load(registration: ClientBundleRegistration): void }
  }
}

const loader = window.__ModuleLoader__
if (loader === undefined) {
  throw new Error(`${PLUGIN_ID}: window.__ModuleLoader__ is missing; the browser half must load as a DSH client bundle`)
}

loader.load({
  id: PLUGIN_ID,
  factory: (require) => {
    const React = require('react') as typeof import('react')
    const { Switch } = require('@deepseek-ai/dsh-client-ui-primitives') as { Switch: SwitchComponent }
    return {
      name: PLUGIN_NAME,
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx: ClientContext): void {
        const form = ctx.configForms.get<ReduceEffectsSettings>(PLUGIN_ID)
        const controller = new EffectsController({ doc: document, win: window, styleMark: EFFECT_STYLE_MARK })
        ctx.effect(() => {
          const sync = (): void => {
            controller.apply(resolveEffectPlan(normalizeSettings(form.getSnapshot().value)))
          }
          const stop = form.subscribe(sync)
          sync()
          return () => {
            stop()
            controller.dispose()
          }
        }, `${PLUGIN_ID}: effect runtime`)

        const Page = createReduceEffectsPage({ React, Switch, form })
        ctx.effect(
          () => ctx.locale.register(LOCALE_NS, { zh, en }),
          `${PLUGIN_ID}: dictionaries`,
        )
        const t = ctx.locale.bind(LOCALE_NS)
        // Served namespaces gate the page: an entry the Host does not expose has
        // no settings behind it, so the page stays out of the navigation.
        ctx.effect(() => ctx.configForms.whileServed([PLUGIN_ID], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: PLUGIN_ID,
          order: 200,
          label: () => t('nav'),
          locale: LOCALE_NS,
        }, Page))), `${PLUGIN_ID}: settings page`)
      },
    }
  },
})
