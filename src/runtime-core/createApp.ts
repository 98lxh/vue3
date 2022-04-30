import { render } from "./render"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {

  return {
    mount(rootContainer) {
      //转换成虚拟节点 后续操作都基于虚拟节点
      //component -> vnode
      //后续的操作基于虚拟节点
      const vnode = createVnode(rootComponent)
      render(vnode, rootContainer)
    }
  }
}
