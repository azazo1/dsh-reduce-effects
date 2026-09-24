/**
 * 配置卡片字段行的样式.
 *
 * 官方 SettingsForm 只覆盖文本与数字字段, 开关字段由本插件的 SwitchField 自绘,
 * 尺寸与间距对齐官方 fields.module.css, 颜色只用 --dsw-alias-* 语义 token.
 */
import { PLUGIN_ID } from '../settings.ts'

/** 样式标签的 data-plugin-css 标记. */
export const FIELD_STYLE_MARK = `${PLUGIN_ID}/fields`

const css = `
.dsh-reduce-effects-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
}
.dsh-reduce-effects-field + .dsh-reduce-effects-field {
  border-top: 0.5px solid var(--dsw-alias-border-l2);
}
.dsh-reduce-effects-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dsh-reduce-effects-label {
  flex: 1;
  min-width: 0;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
}
.dsh-reduce-effects-badges {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.dsh-reduce-effects-reset {
  padding: 0;
  border: none;
  background: none;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 1.5;
  cursor: pointer;
}
.dsh-reduce-effects-reset:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary);
}
.dsh-reduce-effects-reset:disabled {
  cursor: default;
}
.dsh-reduce-effects-hint {
  margin: 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 1.5;
}
`

/** 注入卡片字段样式一次; 重复调用为空操作. */
export function injectFieldStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css="${FIELD_STYLE_MARK}"]`) !== null) return
  const style = document.createElement('style')
  style.dataset.pluginCss = FIELD_STYLE_MARK
  style.textContent = css
  document.head.appendChild(style)
}
