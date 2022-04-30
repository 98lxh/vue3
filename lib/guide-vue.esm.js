const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter)
            return publicGetter(instance);
    }
};

//创建组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
//初始化
function setupComponent(instance) {
    //TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
//创建有状态的组件
function setupStatefulComponent(instance) {
    //找到组件的定义
    const Component = instance.type;
    //ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    //TODO:function
    if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

//render调用patch
function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type === 'string') {
        //处理element
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        //处理组件
        processComponent(vnode, container);
    }
}
//处理element
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    //创建元素
    const { type, props, children } = vnode;
    const el = vnode.el = document.createElement(type);
    if (typeof children === 'string') {
        //文字节点
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
//处理子节点
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}
//处理组件
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initinalVNode, container) {
    const instance = createComponentInstance(initinalVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container);
}
function setupRenderEffect(instance, initinalVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    //vnode -> patch
    //vnode -> element -> mountElement
    patch(subTree, container);
    initinalVNode.el = subTree.el;
}

function createVnode(type, props, children) {
    return {
        type,
        props,
        children,
        el: null
    };
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            //转换成虚拟节点 后续操作都基于虚拟节点
            //component -> vnode
            //后续的操作基于虚拟节点
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

export { createApp, h };
