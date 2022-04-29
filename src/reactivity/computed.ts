import { ReactiveEffect } from "./effect"

//计算属性的内部收集了effect
//当计算属性get操作时 会执行effect.run 
//缓存能力的实现:
//1.内部有一个dirty的属性标记这个值是否为脏值
//2.如果是脏值将dirty设置为false 调用effect的run方法重新计算最值
//3.之后如果内部依赖的响应式数据不进行set操作那么dirty一直为false就不会重新计算直接返回之前计算的值
//4.当内部依赖的响应式数据进行了set操作 会触发effect的trigger schdler会将dirty属性改为true下次
//  在对计算属性取值则需要重新计算

class ComputedRefImpl {
  private _getter: any
  private _dirty: boolean = true
  private _value: any
  private _effect: any

  constructor(getter) {
    this._getter = getter
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }
  get value() {
    //依赖的响应式数据发生改变的时候重置dirty
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }

    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}
