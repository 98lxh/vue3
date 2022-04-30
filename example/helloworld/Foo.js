import { h } from "../../lib/guide-vue.esm.js"

export const foo = {
  setup(props) {
    props.count++
  },
  render() {
    return h('div', {}, "foo: " + this.count)
  }
}
