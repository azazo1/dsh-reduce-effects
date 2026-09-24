/**
 * Browser half. The bundle registers itself with the client module loader, then
 * keeps the frontend effect plan in sync with the stored preferences and
 * contributes the switches card to the Plugins page.
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ReactNode } from 'react'
// Type-only: merges ctx.slots, ctx.configForms and the `plugins.bundle.config` entry.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
// Type-only: merges ctx.locale.
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: merges the SlotRegistry service (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { normalizeSettings, PLUGIN_ID, PLUGIN_NAME, type ReduceEffectsSettings } from '../settings.ts'
import { EffectsController } from './effect-controller.ts'
import { resolveEffectPlan } from './effect-plan.ts'
import { createSwitchField } from './fields.ts'
import { en, LOCALE_NS, zh } from './locales.ts'
import { createReduceEffectsCard } from './settings-card.ts'
import { ReduceEffectsSettingsForm } from './settings-form.ts'
import { injectFieldStyles } from './styles.ts'

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
    const React = require('react') as { createElement: (...args: unknown[]) => ReactNode }
    const primitives = require('@deepseek-ai/dsh-client-ui-primitives') as {
      SettingsForm: (props: Record<string, unknown>) => ReactNode
      SettingsFormModel: ConstructorParameters<typeof ReduceEffectsSettingsForm>[1]
      Switch: (props: Record<string, unknown>) => ReactNode
      Tag: (props: Record<string, unknown>) => ReactNode
    }
    const SwitchField = createSwitchField({ React, Switch: primitives.Switch, Tag: primitives.Tag })
    const Card = createReduceEffectsCard({ React, SettingsForm: primitives.SettingsForm, SwitchField })

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

        injectFieldStyles()
        ctx.effect(
          () => ctx.locale.register(LOCALE_NS, { zh, en }),
          `${PLUGIN_ID}: dictionaries`,
        )

        const card = new ReduceEffectsSettingsForm(form, primitives.SettingsFormModel)
        ctx.effect(() => () => { card.dispose() }, `${PLUGIN_ID}: settings form`)
        // Served entries gate the card: an entry the Host does not expose has no
        // settings behind it, so the card stays off the Plugins page.
        ctx.effect(() => ctx.configForms.whileServed([PLUGIN_ID], () => ctx.slots.inject(
          'plugins.bundle.config',
          () => ctx.slots.register({
            name: 'plugins.bundle.config',
            key: PLUGIN_ID,
            locale: LOCALE_NS,
            inject: () => card.inject(),
          }, Card),
        )), `${PLUGIN_ID}: plugins page card`)
      },
    }
  },
})
