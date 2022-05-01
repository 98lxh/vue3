import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

//render调用patch
export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  const { shapeFlag, type } = vnode
  //shapeFlags
  //vnode -flag
  //element || STATEFUL_COMPONENT
  switch (type) {
    //Fragmemt -> 只渲染children
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ElEMENT) {
        //处理element
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        //处理组件
        processComponent(vnode, container)
      }
      break
  }
}

//处理text
function processText(vnode, container) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}

//处理fragment
function processFragment(vnode, container) {
  mountChildren(vnode, container)
}

//处理element
function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  //创建元素
  const { type, props, children, shapeFlag } = vnode
  const el = vnode.el = document.createElement(type)

  //children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    //文字节点 text_children
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    //array_children
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


