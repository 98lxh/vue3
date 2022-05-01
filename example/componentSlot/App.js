import { h } from "../../lib/guide-vue.esm.js"
import { Foo } from "./Foo.js";

export const App = {
  setup() {
    return {
    }
  },
  render() {
    const app = h('div', {}, 'app')
    const foo = h(Foo, {}, '123')
    return h('div', {}, [app, foo])
  }
}
