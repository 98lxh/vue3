import { h } from "../../lib/guide-vue.esm.js"

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
        class: ['red', 'hard']
      },
      'hi' + this.msg
      // [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'vue')]
    )
  }
}
