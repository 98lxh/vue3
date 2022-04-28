import { extend } from "../shared";
let activeEffect
let shouldTrack

class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true
  onStop?: () => void

  constructor(fn, public scheduler?) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    if (!this.active) {
      //已经被stop不应该收集依赖 直接return
      return this._fn()
    }

    shouldTrack = true
    activeEffect = this;
    const result = this._fn()
    //重置
    shouldTrack = false
    return result
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) this.onStop()
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

/**
 * 收集依赖
*/
const targetMap = new Map()
export function track(target, key) {
  //target -> key -> dep
  if (!isTracking()) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  //已经收集的依赖就不需要在去收集
  trackEffects(dep)
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

/**
 * 触发依赖更新
*/
export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  triggerEffects(dep)
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  //extend
  extend(_effect, options)
  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
