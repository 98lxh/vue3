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
        class: ['red', 'hard'],
        onClick() {
          console.log('click')
        },
        onMousedown() {
          console.log(111)
        }
      },
      'hi' + this.msg
      // [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'vue')]
    )
  }
}
