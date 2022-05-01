import { h } from "../../lib/guide-vue.esm.js"

export const Foo = {
  setup(props) {

    return {}
  },
  render() {
    const foo = h('p', {}, 'foo')

    //Foo.vnode.children
    return h('div', {}, [foo, this.$slots])
  }
}
