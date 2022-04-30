import { isObject } from "../shared/index"
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandler"

export const enum ReactiveFlags {
  IS_REACTIVE = "_v_isReactive",
  IS_READONLY = "_v_isReadonly"
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers)
}

function createActiveObject(target: any, baseHnadlers) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`)
    return target
  } else {
    return new Proxy(target, baseHnadlers)
  }
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}
