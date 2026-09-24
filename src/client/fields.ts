/**
 * 配置卡片里的开关字段行.
 *
 * 官方字段控件只覆盖文本与数字, 布尔字段由这里用官方 Switch 拼出, 排版沿用官方
 * fields.module.css 的尺寸与间距. 本 bundle 不 external 平台模块, React 与官方
 * 控件都由 client factory 的 require 注入, 所以这里写成工厂 + createElement.
 */

import type { ReactNode } from 'react'

/** 组件用到的平台模块. */
export interface SwitchFieldUi {
  /** module loader 提供的 react. */
  React: { createElement: (...args: unknown[]) => ReactNode }
  /** 官方开关控件. */
  Switch: (props: Record<string, unknown>) => ReactNode
  /** 官方标签控件, 用作 "已覆盖" 标记. */
  Tag: (props: Record<string, unknown>) => ReactNode
}

/** 开关字段行的 props. */
export interface SwitchFieldProps {
  /** 标签与控件的关联 id. */
  id: string
  /** 已本地化的字段标签. */
  label: string
  /** 字段说明. */
  hint: string
  /** 当前草稿值. */
  checked: boolean
  /** 保存后该字段是否留下 user 层条目. */
  overridden: boolean
  /** 覆盖标记的文案. */
  overriddenLabel: string
  /** 重置控件的文案. */
  resetLabel: string
  /** 只读或保存中时锁定控件. */
  disabled: boolean
  /** 切换开关. */
  onToggle: (next: boolean) => void
  /** 暂存清空该字段, 保存后回落到组合层. */
  onReset: () => void
}

/**
 * 造出开关字段行组件.
 * @param ui - React 与官方控件.
 * @returns 开关字段行组件.
 */
export function createSwitchField(ui: SwitchFieldUi): (props: SwitchFieldProps) => ReactNode {
  const { React, Switch, Tag } = ui
  /** createElement 短写: 本 bundle 不编译 JSX. */
  const el = (type: unknown, props: unknown, ...children: unknown[]): ReactNode =>
    React.createElement.apply(null, [type, props].concat(children) as unknown[])

  return function SwitchField(props: SwitchFieldProps): ReactNode {
    const badges = props.overridden
      ? el('span', { className: 'dsh-reduce-effects-badges' },
        el(Tag, { tone: 'neutral' }, props.overriddenLabel),
        el('button', {
          type: 'button',
          className: 'dsh-reduce-effects-reset',
          disabled: props.disabled,
          onClick: props.onReset,
        }, props.resetLabel))
      : null

    return el('div', { className: 'dsh-reduce-effects-field' },
      el('div', { className: 'dsh-reduce-effects-head' },
        el('span', { className: 'dsh-reduce-effects-label', id: `${props.id}-label` }, props.label),
        badges,
        el(Switch, {
          checked: props.checked,
          label: props.label,
          disabled: props.disabled,
          onChange: props.onToggle,
        })),
      el('p', { className: 'dsh-reduce-effects-hint' }, props.hint))
  }
}
