import { shallowReadonly } from "../reactivity/reactive";
import { isObject } from "../shared/index";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandler } from "./componentPublicInstance";

//创建组件实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => { }
  }

  //初始化emit
  component.emit = emit.bind(null, component) as any

  return component
}

//初始化
export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  //TODO
  // initSlots()
  setupStatefulComponent(instance)
}

//创建有状态的组件
function setupStatefulComponent(instance: any) {
  //找到组件的定义
  const Component = instance.type;

  //ctx
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler)

  const { setup } = Component

  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  //TODO:function
  if (isObject(setupResult)) {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type
  instance.render = Component.render
}
