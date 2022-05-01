import { h, renderSlots, getCurrentInstance } from "../../lib/guide-vue.esm.js"

export const Foo = {
  name: 'Foo',
  setup(props) {
    console.log(getCurrentInstance())
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
