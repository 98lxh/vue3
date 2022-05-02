import { effect } from "../reactivity/effect"
import { EMPTY_OBJ } from "../shared"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createRender(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRomve,
    setElementText: hostSetElementText
  } = options

  //render调用patch
  function render(vnode, container) {
    patch(null, vnode, container, null)
  }

  //n1 老节点 n2 新节点
  function patch(n1, n2, container, parentComponent) {
    const { shapeFlag, type } = n2
    //shapeFlags
    //vnode -flag
    //element || STATEFUL_COMPONENT
    switch (type) {
      //Fragmemt -> 只渲染children
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ElEMENT) {
          //处理element
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //处理组件
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  //处理text
  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  //处理fragment
  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }

  //处理element
  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function patchElement(n1, n2, container, parentComponent) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = n2.el = n1.el

    //更新子节点
    patchChildren(n1, n2, el, parentComponent)
    //更新属性
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent) {
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //新节点是文本节点
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //新节点是文本 老节点是数组
        //1.把老的 children 清空
        unmountChildren(c1)
      }


      if (c1 !== c2) {
        //将节点的text换成新节点的text
        hostSetElementText(container, c2)
      }
    } else {
      //新节点不是文本节点
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent)
      }
    }


  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRomve(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (let key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key]

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (let key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function mountElement(vnode, container, parentComponent) {
    //创建元素
    const { type, props, children, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type)

    //children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //文字节点 text_children
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      //array_children
      mountChildren(vnode.children, el, parentComponent)
    }

    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }

    hostInsert(el, container)
  }

  //处理子节点
  function mountChildren(children, container, parentComponent) {
    children.forEach(v => {
      patch(null, v, container, parentComponent)
    })
  }

  //处理组件
  function processComponent(n1, n2, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initinalVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initinalVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initinalVNode, container)
  }

  function setupRenderEffect(instance, initinalVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        const subTree = instance.subTree = instance.render.call(proxy)
        //vnode -> patch
        //vnode -> element -> mountElement
        patch(null, subTree, container, instance)

        initinalVNode.el = subTree.el
        instance.isMounted = true
      } else {
        //update
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}
