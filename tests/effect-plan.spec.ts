import { describe, expect, it } from 'vitest'
import { CATEGORY_FIELDS, DEFAULT_SETTINGS, normalizeSettings } from '../src/settings.ts'
import { planIsIdle, resolveEffectPlan } from '../src/client/effect-plan.ts'

describe('normalizeSettings', () => {
  it('keeps every effect on for unknown sections', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings('motion')).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings({ motion: 'yes', master: 1 })).toEqual(DEFAULT_SETTINGS)
  })

  it('reads explicit switches off and leaves the rest on', () => {
    const settings = normalizeSettings({ motion: false, jsMotion: false })
    expect(settings.motion).toBe(false)
    expect(settings.jsMotion).toBe(false)
    expect(settings.blur).toBe(true)
    expect(settings.master).toBe(true)
  })
})

describe('resolveEffectPlan', () => {
  it('is idle while every switch is on', () => {
    expect(planIsIdle(resolveEffectPlan(DEFAULT_SETTINGS))).toBe(true)
  })

  it('maps each category onto its own decision', () => {
    const plan = resolveEffectPlan({ ...DEFAULT_SETTINGS, blur: false, gradients: false })
    expect(plan.blur).toBe(false)
    expect(plan.gradients).toBe(false)
    expect(plan.motion).toBe(true)
    expect(planIsIdle(plan)).toBe(false)
  })

  it('turns every category off with the master switch', () => {
    const plan = resolveEffectPlan({ ...DEFAULT_SETTINGS, master: false })
    for (const field of CATEGORY_FIELDS) expect(plan[field]).toBe(false)
    expect(planIsIdle(plan)).toBe(false)
  })

  it('keeps each category value under the master switch', () => {
    const settings = { ...DEFAULT_SETTINGS, master: false, spinnerMotion: false, blur: false }
    const plan = resolveEffectPlan(settings)
    expect(plan.spinnerMotion).toBe(false)
    expect(plan.blur).toBe(false)
    // 关掉总开关不改动各分类自己的值, 重新打开就原样恢复.
    const restored = resolveEffectPlan({ ...settings, master: true })
    expect(restored.spinnerMotion).toBe(false)
    expect(restored.blur).toBe(false)
    expect(restored.motion).toBe(true)
  })
})
