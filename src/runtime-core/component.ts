import { isObject } from "../shared/index";
import { publicInstanceProxyHandler } from "./componentPublicInstance";

//创建组件实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }

  return component
}

//初始化
export function setupComponent(instance) {
  //TODO
  // initProps()
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
    const setupResult = setup()

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
