import { describe, expect, it } from 'vitest'
import { CATEGORY_FIELDS, DEFAULT_SETTINGS, MASTER_EXEMPT_FIELD, normalizeSettings } from '../src/settings.ts'
import { planIsIdle, resolveEffectPlan } from '../src/client/effect-plan.ts'

describe('normalizeSettings', () => {
  it('keeps every category off for unknown sections', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings('motion')).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings({ motion: 'yes', master: 1 })).toEqual(DEFAULT_SETTINGS)
  })

  it('reads the booleans it knows and defaults the rest', () => {
    const settings = normalizeSettings({ motion: true, jsMotion: true })
    expect(settings.motion).toBe(true)
    expect(settings.jsMotion).toBe(true)
    expect(settings.blur).toBe(false)
    expect(settings.master).toBe(false)
  })
})

describe('resolveEffectPlan', () => {
  it('is idle while every switch is off', () => {
    expect(planIsIdle(resolveEffectPlan(DEFAULT_SETTINGS))).toBe(true)
  })

  it('maps each category onto its own decision', () => {
    const plan = resolveEffectPlan({ ...DEFAULT_SETTINGS, blur: true, gradients: true })
    expect(plan.blur).toBe(true)
    expect(plan.gradients).toBe(true)
    expect(plan.motion).toBe(false)
    expect(planIsIdle(plan)).toBe(false)
  })

  it('lets the master switch turn on every category except the loading feedback', () => {
    const plan = resolveEffectPlan({ ...DEFAULT_SETTINGS, master: true })
    for (const field of CATEGORY_FIELDS) expect(plan[field]).toBe(field !== MASTER_EXEMPT_FIELD)
    expect(planIsIdle(plan)).toBe(false)
  })

  it('keeps the loading switch independent of the master switch', () => {
    const plan = resolveEffectPlan({ ...DEFAULT_SETTINGS, master: true, spinnerMotion: true })
    expect(plan.spinnerMotion).toBe(true)
  })

  it('counts a plan that only stops loading feedback as idle', () => {
    expect(planIsIdle(resolveEffectPlan({ ...DEFAULT_SETTINGS, spinnerMotion: true }))).toBe(true)
  })
})
