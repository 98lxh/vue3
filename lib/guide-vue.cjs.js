'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
/**
 * 收集依赖
*/
const targetMap = new Map();
/**
 * 触发依赖更新
*/
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (key === "_v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "_v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        //如果是shallow 则不需要对嵌套的对象做任何操作
        if (shallow) {
            return res;
        }
        //如果res是object则需要对res在做reactive/readonly
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`failed to set ${key} Because it is readonly`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(target, baseHnadlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return target;
    }
    else {
        return new Proxy(target, baseHnadlers);
    }
}

function emit(instance, event, ...rest) {
    const { props } = instance;
    //TPP 先写特定行为 重构成通用行为
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...rest);
}

//初始化组件的props
function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
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
        setupState: {},
        props: {},
        emit: () => { }
    };
    //初始化emit
    component.emit = emit.bind(null, component);
    return component;
}
//初始化
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    //TODO
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
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
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

exports.createApp = createApp;
exports.h = h;
