import { mutableHandlers, readonlyHandlers } from "./baseHandler"

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

function createActiveObject(raw: any, baseHnadlers) {
  return new Proxy(raw, baseHnadlers)
}
