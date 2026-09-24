/**
 * dsh-reduce-effects 配置卡片的暂存表单.
 *
 * 表单是 profile 条目 volatile Config 的投影: 草稿只留在卡片页, 保存才写回 profile 的 patch 层.
 */
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type {
  SettingsFieldSpec, SettingsFieldState, SettingsFormActions,
  SettingsFormScope, SettingsFormShell,
} from '@deepseek-ai/dsh-client-ui-primitives'
import {
  CATEGORY_FIELDS, MASTER_FIELD,
  type CategoryField, type ReduceEffectsSettings,
} from '../settings.ts'

/**
 * 官方 SettingsFormModel 的构造器形状.
 * 本 bundle 不 external 平台模块, 真实实现由 client factory 从 module loader 注入.
 */
export interface SettingsFormModelLike {
  new (scope: SettingsFormScope<ReduceEffectsSettings>, specs: readonly SettingsFieldSpec[]): {
    bind<S>(project: () => S): SnapshotStore<S>
    shell(): SettingsFormShell
    field(name: string): SettingsFieldState
    actions(): SettingsFormActions
    dispose(): void
  }
}

/**
 * 布尔字段的草稿编码: 官方模型只解析文本字段, 布尔值以 `true` / `false` 暂存.
 * @param field - 字段名.
 * @returns 该字段的转换描述.
 */
function settingsBooleanField(field: string): SettingsFieldSpec {
  return {
    field,
    format: value => typeof value === 'boolean' ? String(value) : '',
    parse: text => text === 'true'
      ? { kind: 'set', value: true }
      : text === 'false'
        ? { kind: 'set', value: false }
        : undefined,
  }
}

/** 卡片读到的状态: 总开关加每个分类的开关. */
export interface ReduceEffectsCardState extends SettingsFormShell, Record<CategoryField, SettingsFieldState> {
  /** 全部特效的总开关. */
  master: SettingsFieldState
}

/** 卡片注册时注入给组件的面. */
export interface ReduceEffectsCardFace extends SettingsFormActions {
  hooks: {
    /** 组件通过它读快照 (useReduceEffectsCard). */
    reduceEffectsCard: SnapshotStore<ReduceEffectsCardState>
  }
}

/** 把本插件条目的配置表单桥接成配置卡片的暂存表单. */
export class ReduceEffectsSettingsForm {
  private readonly form: InstanceType<SettingsFormModelLike>
  private readonly store: SnapshotStore<ReduceEffectsCardState>

  /**
   * @param scope - 本插件 profile 条目的共享配置表单 (ctx.configForms.get).
   * @param SettingsFormModel - 官方表单模型构造器.
   */
  constructor(scope: SettingsFormScope<ReduceEffectsSettings>, SettingsFormModel: SettingsFormModelLike) {
    this.form = new SettingsFormModel(scope, [
      settingsBooleanField(MASTER_FIELD),
      ...CATEGORY_FIELDS.map(field => settingsBooleanField(field)),
    ])
    this.store = this.form.bind(() => ({
      ...this.form.shell(),
      master: this.form.field(MASTER_FIELD),
      ...Object.fromEntries(CATEGORY_FIELDS.map(field => [field, this.form.field(field)])) as Record<CategoryField, SettingsFieldState>,
    }))
  }

  /**
   * 构造 slot 注册要注入的面.
   * @returns 快照 hook 与表单动作.
   */
  inject(): ReduceEffectsCardFace {
    return { hooks: { reduceEffectsCard: this.store }, ...this.form.actions() }
  }

  /** 释放对配置表单的订阅. */
  dispose(): void {
    this.form.dispose()
  }
}
