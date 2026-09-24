/**
 * 插件页里 dsh-reduce-effects 卡片的配置页.
 *
 * 页面只在 Host 真的组合了本条目的期间注册 (configForms.whileServed).
 * 本 bundle 不 external 平台模块, React 与官方控件都由 client factory 的 require 注入.
 */
import type { ReactNode } from 'react'
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots'
import {
  CATEGORY_FIELDS, MASTER_FIELD,
  type CategoryField,
} from '../settings.ts'
import { formLabels, type ReduceEffectsKey } from './locales.ts'
import type { ReduceEffectsCardFace } from './settings-form.ts'
import type { SwitchFieldProps } from './fields.ts'

/** 组件用到的平台模块与官方控件. */
export interface ReduceEffectsCardUi {
  /** module loader 提供的 react. */
  React: { createElement: (...args: unknown[]) => ReactNode }
  /** 官方整页表单框架. */
  SettingsForm: (props: Record<string, unknown>) => ReactNode
  /** 本插件的开关字段行组件. */
  SwitchField: (props: SwitchFieldProps) => ReactNode
}

/** 组件 props 里本插件读取的字段. */
export type ReduceEffectsCardProps = InjectFace<ReduceEffectsCardFace> & {
  /** 页面问的视图: summary 给一行简介, page 给完整表单. */
  readonly view: 'summary' | 'page'
  /** 本插件字典的读取函数. */
  readonly t: (key: ReduceEffectsKey) => string
}

/**
 * 造出插件页卡片组件.
 * @param ui - React 与官方控件.
 * @returns 卡片组件.
 */
export function createReduceEffectsCard(ui: ReduceEffectsCardUi): (props: ReduceEffectsCardProps) => ReactNode {
  const { React, SettingsForm, SwitchField } = ui
  /** createElement 短写: 本 bundle 不编译 JSX. */
  const el = (type: unknown, props: unknown, ...children: unknown[]): ReactNode =>
    React.createElement.apply(null, [type, props].concat(children) as unknown[])

  return function ReduceEffectsCard(props: ReduceEffectsCardProps): ReactNode {
    const { t } = props
    const state = props.useReduceEffectsCard(snapshot => snapshot)
    if (props.view === 'summary') return t('description')
    const disabled = !state.writable
    // 总闸关掉时各分类都不生效, 与旧页面一致: 分类开关暂时不可点, 但保留各自的值.
    const masterOn = state.master.text === 'true'

    const field = (name: 'master' | CategoryField, order: number): unknown => el(SwitchField, {
      id: `plugin-config-reduce-effects-${name}`,
      label: t(name),
      hint: t(`${name}Hint` as ReduceEffectsKey),
      checked: state[name].text === 'true',
      overridden: state[name].overridden,
      overriddenLabel: t('overridden'),
      resetLabel: t('reset'),
      disabled: disabled || (name !== MASTER_FIELD && !masterOn),
      onToggle: (next: boolean) => { props.edit(name, next ? 'true' : 'false') },
      onReset: () => { props.resetField(name) },
      key: `field-${String(order)}`,
    })

    return el(
      SettingsForm,
      { labels: formLabels(t), state, onSave: props.save, onDiscard: props.discard },
      field(MASTER_FIELD, 0),
      ...CATEGORY_FIELDS.map((name, index) => field(name, index + 1)),
    )
  }
}
