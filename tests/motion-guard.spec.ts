import { describe, expect, it, vi } from 'vitest'
import { isLoadingAnimation } from '../src/client/loading-animation.ts'
import { guardAnimations, installMotionGuard, type MotionGuardMode } from '../src/client/motion-guard.ts'

/** 造一个只带判定所需字段的假动画. */
function fakeAnimation(name: string | undefined, iterations: number) {
  return {
    animationName: name,
    effect: { getTiming: () => ({ iterations }) },
    cancel: vi.fn(),
    finish: vi.fn(),
  }
}

type FakeAnimation = ReturnType<typeof fakeAnimation>

const asAnimation = (fake: FakeAnimation): Animation => fake as unknown as Animation

const INFINITE = Infinity

describe('isLoadingAnimation', () => {
  it('keeps the loading and progress keyframes DSH ships today', () => {
    for (const name of [
      'spin', 'spinner-rotate', 'file-card-spin', 'file-card-progress',
      'dsh-state-dot-spin', 'dsh-state-dot-dash', 'dsh-state-dot-chase',
      'reveal-second-dot', 'reveal-third-dot', 'input-pending',
      'dsh-turn-mark-busy', 'terminal-cursor-blink',
    ]) {
      expect(isLoadingAnimation(name), name).toBe(true)
    }
  })

  it('leaves decorative and entrance keyframes alone', () => {
    for (const name of [
      'fade-in', 'dsh-text-shimmer', 'retry-shimmer', 'search-skeleton',
      'dsh-menu-skeleton', 'hero-fish-swim', 'tooltip-in', 'dsh-toast-in',
      'dsh-turn-preview-enter', 'dockScrimIn',
    ]) {
      expect(isLoadingAnimation(name), name).toBe(false)
    }
  })
})

describe('guardAnimations', () => {
  it('cancels a looping decoration and finishes a one-shot one', () => {
    const shimmer = fakeAnimation('dsh-text-shimmer', INFINITE)
    const entrance = fakeAnimation('fade-in', 1)
    guardAnimations([asAnimation(shimmer), asAnimation(entrance)], 'keep-loading')
    expect(shimmer.cancel).toHaveBeenCalledOnce()
    expect(shimmer.finish).not.toHaveBeenCalled()
    expect(entrance.finish).toHaveBeenCalledOnce()
    expect(entrance.cancel).not.toHaveBeenCalled()
  })

  it('keeps loaders in keep-loading mode and stops them in stop-loading mode', () => {
    const spinner = fakeAnimation('spinner-rotate', INFINITE)
    const progress = fakeAnimation('file-card-progress', INFINITE)
    const shimmer = fakeAnimation('dsh-text-shimmer', INFINITE)

    guardAnimations([asAnimation(spinner), asAnimation(progress), asAnimation(shimmer)], 'keep-loading')
    for (const animation of [spinner, progress]) expect(animation.cancel).not.toHaveBeenCalled()
    expect(shimmer.cancel).toHaveBeenCalledOnce()

    const kept = fakeAnimation('dsh-text-shimmer', INFINITE)
    guardAnimations([asAnimation(spinner), asAnimation(progress), asAnimation(kept)], 'stop-loading')
    for (const animation of [spinner, progress]) expect(animation.cancel).toHaveBeenCalledOnce()
    expect(kept.cancel).not.toHaveBeenCalled()
  })

  it('leaves transitions alone in both modes', () => {
    for (const mode of ['keep-loading', 'stop-loading'] as MotionGuardMode[]) {
      const transition = fakeAnimation(undefined, 1)
      guardAnimations([asAnimation(transition)], mode)
      expect(transition.cancel).not.toHaveBeenCalled()
      expect(transition.finish).not.toHaveBeenCalled()
    }
  })

  it('survives an animation another part of the page already settled', () => {
    const shimmer = fakeAnimation('dsh-text-shimmer', INFINITE)
    shimmer.cancel.mockImplementation(() => { throw new Error('already cancelled') })
    const entrance = fakeAnimation('fade-in', 1)
    guardAnimations([asAnimation(shimmer), asAnimation(entrance)], 'keep-loading')
    expect(entrance.finish).toHaveBeenCalledOnce()
  })
})

describe('installMotionGuard', () => {
  /** 记下监听器, 好让测试手动触发 animationstart. */
  function harness(initial: FakeAnimation[]) {
    const handlers = new Set<(event: Event) => void>()
    const doc = {
      getAnimations: () => initial.map(asAnimation),
      addEventListener: (type: string, handler: (event: Event) => void) => {
        if (type === 'animationstart') handlers.add(handler)
      },
      removeEventListener: (type: string, handler: (event: Event) => void) => {
        if (type === 'animationstart') handlers.delete(handler)
      },
    }
    return { doc, handlers }
  }

  it('sweeps what is already animating, then follows new animations', () => {
    const running = fakeAnimation('dsh-text-shimmer', INFINITE)
    const { doc, handlers } = harness([running])
    const stop = installMotionGuard(doc as unknown as Document, 'keep-loading')
    expect(running.cancel).toHaveBeenCalledOnce()
    expect(handlers.size).toBe(1)

    const late = fakeAnimation('hero-fish-swim', INFINITE)
    const target = { getAnimations: () => [asAnimation(late)] }
    for (const handler of handlers) handler({ target } as unknown as Event)
    expect(late.cancel).toHaveBeenCalledOnce()

    stop()
    expect(handlers.size).toBe(0)
  })
})
