/**
 * The effect switches page: one master row plus one row per effect category.
 * Rows write straight through the shared configuration form, so a switch takes
 * effect on the same snapshot that carries the new value.
 */

import type { ReactElement } from 'react'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  CATEGORY_FIELDS, MASTER_EXEMPT_FIELD, MASTER_FIELD, normalizeSettings,
  type CategoryField, type ReduceEffectsSettings,
} from '../settings.ts'
import { upsertStyle } from './dom-style.ts'
import { LOCALE_NS, type ReduceEffectsKey } from './locales.ts'
import { PAGE_CSS, PAGE_STYLE_MARK } from './page-css.ts'

/** Minimal face of the ui-primitives switch this page renders. */
export interface SwitchComponent {
  (props: {
    checked: boolean
    onChange: (next: boolean) => void
    label: string
    disabled?: boolean
    title?: string | undefined
    className?: string | undefined
  }): ReactElement
}

/** What the page receives from the client composition. */
export interface ReduceEffectsPageDeps {
  /** React runtime resolved from the loader module table. */
  React: typeof import('react')
  /** Switch control resolved from the loader module table. */
  Switch: SwitchComponent
  /** Shared configuration form of this plugin's settings entry. */
  form: ConfigForm<ReduceEffectsSettings>
}

/** Props the settings shell binds for a section page. */
export type ReduceEffectsPageProps =
  PropsRuntime<'settings.section'> & PropsLocale<typeof LOCALE_NS>

/**
 * Build the page component.
 * @param deps - React, the switch control, and the settings form.
 * @returns the component the `settings.section` entry renders.
 */
export function createReduceEffectsPage(
  deps: ReduceEffectsPageDeps,
): (props: ReduceEffectsPageProps) => ReactElement {
  const { React, Switch, form } = deps
  // Published once per page load, whether or not the page is opened: the sheet
  // is a few hundred bytes and the element is addressed by its marker.
  upsertStyle(document, PAGE_STYLE_MARK, PAGE_CSS)

  return function ReduceEffectsPage(props: ReduceEffectsPageProps): ReactElement {
    const { t } = props
    const snapshot = React.useSyncExternalStore(
      onChange => form.subscribe(onChange),
      () => form.getSnapshot(),
    )
    const settings = normalizeSettings(snapshot.value)
    const masterOn = settings[MASTER_FIELD]
    const [pending, setPending] = React.useState(false)
    const [failed, setFailed] = React.useState(false)

    // A refused write leaves the served value in place, so the row keeps the
    // value the Host accepted; only the note below reports the refusal.
    const write = (field: string, next: boolean): void => {
      setPending(true)
      setFailed(false)
      void form.set(field, next).then(
        (accepted) => { setFailed(!accepted) },
        () => { setFailed(true) },
      ).finally(() => { setPending(false) })
    }

    const locked = !snapshot.writable || pending
    const row = (
      key: string,
      labelKey: ReduceEffectsKey,
      hintKey: ReduceEffectsKey,
      checked: boolean,
      disabled: boolean,
      title: string | undefined,
    ): ReactElement => React.createElement(
      'div',
      { className: 'dsh-reduce-effects-row', key },
      React.createElement(
        'div',
        { className: 'dsh-reduce-effects-rowText' },
        React.createElement('div', { className: 'dsh-reduce-effects-rowLabel' }, t(labelKey)),
        React.createElement('div', { className: 'dsh-reduce-effects-rowHint' }, t(hintKey)),
      ),
      React.createElement(Switch, {
        checked,
        disabled,
        label: t(labelKey),
        title,
        className: 'dsh-reduce-effects-switch',
        onChange: (next: boolean) => { write(key, next) },
      }),
    )

    // 总开关不代管加载动画, 所以那一行在总开关打开时仍可点, 也不挂强制提示.
    const rows: ReactElement[] = [
      row(MASTER_FIELD, 'master', 'masterHint', masterOn, locked, undefined),
      ...CATEGORY_FIELDS.map((field: CategoryField) => {
        const forced = masterOn && field !== MASTER_EXEMPT_FIELD
        return row(
          field,
          field,
          `${field}Hint`,
          settings[field],
          locked || forced,
          forced ? t('masterNotice') : undefined,
        )
      }),
    ]

    const statusNote = snapshot.status === 'loading'
      ? t('loading')
      : !snapshot.writable
        ? t('notWritable')
        : failed
          ? t('writeFailed')
          : undefined

    return React.createElement(
      'section',
      { className: 'dsh-reduce-effects-page' },
      React.createElement('h2', { className: 'dsh-reduce-effects-title' }, t('title')),
      React.createElement('p', { className: 'dsh-reduce-effects-intro' }, t('intro')),
      React.createElement(
        'div',
        { className: 'dsh-reduce-effects-card' },
        React.createElement('div', { className: 'dsh-reduce-effects-cardTitle' }, t('cardTitle')),
        ...rows,
      ),
      masterOn
        ? React.createElement('p', { className: 'dsh-reduce-effects-note' }, t('masterNotice'))
        : null,
      statusNote === undefined
        ? null
        : React.createElement('p', { className: 'dsh-reduce-effects-note' }, statusNote),
    )
  }
}
