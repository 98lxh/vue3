import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

//render调用patch
export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  if (typeof vnode.type === 'string') {
    //处理element
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    //处理组件
    processComponent(vnode, container)
  }
}

//处理element
function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  //创建元素
  const { type, props, children } = vnode
  const el = vnode.el = document.createElement(type)

  if (typeof children === 'string') {
    //文字节点
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }

  for (const key in props) {
    const val = props[key]
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }

  container.append(el)
}

//处理子节点
function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container)
  })
}

//处理组件
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(initinalVNode: any, container) {
  const instance = createComponentInstance(initinalVNode)
  setupComponent(instance)
  setupRenderEffect(instance, initinalVNode, container)
}

function setupRenderEffect(instance, initinalVNode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  //vnode -> patch
  //vnode -> element -> mountElement
  patch(subTree, container)

  initinalVNode.el = subTree.el
}


