import { ShapeFlags } from "../shared/shapeFlags"
import { Text } from "./renderer"

export function createVnode(type, props?, children?) {

  const vnode = {
    type,
    props,
    children,
    key: props && props.key,
    shapeFlag: getShapeFlag(type),
    el: null
  }

  //children shape
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}
export function createTextVnode(text: string) {
  return createVnode(Text, {}, text)
}

function getShapeFlag(type) {
  return typeof type === 'string'
    ? ShapeFlags.ElEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}
