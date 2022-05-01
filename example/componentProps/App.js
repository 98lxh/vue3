import { h } from "../../lib/guide-vue.esm.js"
import { foo } from "./Foo.js";

window.self = null
export const App = {
  setup() {
    return {
      msg: "vue"
    }
  },
  render() {
    window.self = this;
    return h('div',
      {
        id: "root",
        class: 'hard',
      },
      [h('div', {}, 'hi,' + this.msg),
      h(foo, {
        count: 1
      })
      ]
    )
  }
}
