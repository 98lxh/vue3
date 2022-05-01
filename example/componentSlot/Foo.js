import { h, renderSlots } from "../../lib/guide-vue.esm.js"

export const Foo = {
  setup(props) {

    return {}
  },
  render() {
    const foo = h('p', {}, 'foo')
    const age = 18;
    //Foo.vnode.children
    //获取渲染的元素
    //获取渲染的位置
    return h('div', {}, [
      renderSlots(this.$slots, 'header'),
      foo,
      renderSlots(this.$slots, 'footer', {
        age
      })
    ])
  }
}
