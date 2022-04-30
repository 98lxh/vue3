import { render } from "./render"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {

  return {
    mount(rootComponent) {
      //转换成虚拟节点 后续操作都基于虚拟节点
      //component -> vnode
      const vnode = createVnode(rootComponent)

      render(vnode, rootComponent)
    }
  }
}
