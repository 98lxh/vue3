import { h } from "../../lib/guide-vue.esm.js"
export const App = {
  setup() {
    return {
      msg: "vue"
    }
  },
  render() {
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
