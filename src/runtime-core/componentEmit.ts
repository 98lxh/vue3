import { camelize, toHandlerKey } from "../shared/index"

export function emit(instance, event, ...rest) {
  const { props } = instance
  //TPP 先写特定行为 重构成通用行为
  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...rest)
}
