import { h, createTextVnode, getCurrentInstance } from "../../lib/guide-vue.esm.js"
import { Foo } from "./Foo.js";

export const App = {
  name: 'App',
  render() {

    const app = h('div', {}, 'app')
    const foo = h(Foo, {}, {
      //具名插槽
      header: () => [h('p', {}, 'header'), createTextVnode('hello')],
      //作用域插槽
      footer: ({ age }) => h('p', {}, 'footer' + age),
    })

    return h('div', {}, [app, foo])
  },
  setup() {
    console.log(getCurrentInstance())
    return {
    }
  }
}
