import { h } from "../../lib/guide-vue.esm.js"
import ArrayToArray from "./ArrayToArray.js"
import ArrayToText from "./ArrayToText.js"
import TextToArray from "./TextToArray.js"
import TextToText from "./TextToText.js"

export const App = {
  setup() {

  },
  render() {
    return h('div', { tId: 1 }, [
      h('p', {}, '主页'),
      //老节点是Array 新节点是 Text
      // h(ArrayToText)
      //老节点是Text 新节点也是Text
      // h(TextToText)
      //老节点是Text 新节点是Array
      // h(TextToArray)
      //老节点是Array 新节点也是Array
      h(ArrayToArray)
    ])
  }
}
