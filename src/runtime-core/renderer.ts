import { effect } from "../reactivity/effect"
import { EMPTY_OBJ } from "../shared"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { shouldUpdateComponent } from "./componentUpdateUtils"
import { createAppAPI } from "./createApp"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createRender(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  //render调用patch
  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }

  //n1 老节点 n2 新节点
  function patch(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag, type } = n2
    //shapeFlags
    //vnode -flag
    //element || STATEFUL_COMPONENT
    switch (type) {
      //Fragmemt -> 只渲染children
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ElEMENT) {
          //处理element
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //处理组件
          processComponent(n1, n2, container, parentComponent, anchor)
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
  function processFragment(n1, n2, container, parentComponent, anthor) {
    mountChildren(n2.children, container, parentComponent, anthor)
  }

  //处理element
  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = n2.el = n1.el

    //更新子节点
    patchChildren(n1, n2, el, parentComponent, anchor)
    //更新属性
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //新节点是文本节点
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //新节点是文本 老节点是数组
        //把老的 children 清空
        unmountChildren(c1)
      }

      if (c1 !== c2) {
        //将节点的text换成新节点的text
        hostSetElementText(container, c2)
      }
    } else {
      //新节点是Array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        //老节点是Text 新节点是Array
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        //老节点和新节点都是Array
        //Array diff Array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    const l2 = c2.length
    let i = 0;
    let e1 = c1.length - 1
    let e2 = l2 - 1

    //左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    //右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      e1--
      e2--
    }

    //3.新的比老的多 创建新的
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        //这里是判断左侧新增还是右侧新增 当小于新节点length是代表是左侧新增需要一个锚点
        //大于则代表右侧新增直接插入
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      //新旧节点一样长 乱序部分
      let s1 = i
      let s2 = i
      const toBePatched = e2 - s2 + 1
      let patched = 0;
      let moved = false;
      let maxNewIndexSoFar = 0
      //建立一个基于新节点的映射表
      const keyToNewIndexMap = new Map()
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0;
      }

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]

        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }

        let newIndex

        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          //没有key 需要遍历查找
          for (let j = s2; j <= e2; j++) {
            if (isSameVnodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          //在新节点中不存在
          hostRemove(prevChild.el)
        } else {
          //在新节点中存在
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      //最长递归子序列
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
      let j = increasingNewIndexSequence.length - 1

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

        if (newIndexToOldIndexMap[i] === 0) {
          //创建
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  //基于type和key对比
  function isSameVnodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
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

  function mountElement(vnode, container, parentComponent, anthor) {
    //创建元素
    const { type, props, children, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type)

    //children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //文字节点 text_children
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      //array_children
      mountChildren(vnode.children, el, parentComponent, anthor)
    }

    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }

    hostInsert(el, container, anthor)
  }

  //处理子节点
  function mountChildren(children, container, parentComponent, anthor) {
    children.forEach(v => {
      patch(null, v, container, parentComponent, anthor)
    })
  }

  //处理组件
  function processComponent(n1, n2, container: any, parentComponent, anchor) {
    if (!n1) {
      //组件初始化
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      //update
      updateComponent(n1, n2)
    }
  }

  function updateComponent(n1, n2) {
    const instance = n2.component = n1.component
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      n2.vnode = n2
    }
  }

  function mountComponent(initinalVNode: any, container, parentComponent, anchor) {
    const instance = initinalVNode.component = createComponentInstance(initinalVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initinalVNode, container, anchor)
  }

  function setupRenderEffect(instance, initinalVNode, container, anchor) {
    instance.update = effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        const subTree = instance.subTree = instance.render.call(proxy)
        //vnode -> patch
        //vnode -> element -> mountElement
        patch(null, subTree, container, instance, anchor)

        initinalVNode.el = subTree.el
        instance.isMounted = true
      } else {
        //update
        //需要一个更新后的vnode
        const { next, vnode } = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        }
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode
  instance.next = null
  instance.props = nextVNode.props
}


function getSequence(arr) {
  const p = arr.slice()                 //  保存原始数据
  const result = [0]                    //  存储最长增长子序列的索引数组
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]     //  j是子序列索引最后一项
      if (arr[j] < arrI) {              //  如果arr[i] > arr[j], 当前值比最后一项还大，可以直接push到索引数组(result)中去
        p[i] = j                        //  p记录第i个位置的索引变为j
        result.push(i)
        continue
      }
      u = 0                             //  数组的第一项
      v = result.length - 1             //  数组的最后一项
      while (u < v) {                   //  如果arrI <= arr[j] 通过二分查找，将i插入到result对应位置；u和v相等时循环停止
        c = ((u + v) / 2) | 0           //  二分查找 
        if (arr[result[c]] < arrI) {
          u = c + 1                     //  移动u
        } else {
          v = c                         //  中间的位置大于等于i,v=c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]          //  记录修改的索引
        }
        result[u] = i                   //  更新索引数组(result)
      }
    }
  }
  u = result.length
  v = result[u - 1]
  //把u值赋给result  
  while (u-- > 0) {                     //  最后通过p数组对result数组进行进行修订，取得正确的索引
    result[u] = v
    v = p[v];
  }
  return result
}
