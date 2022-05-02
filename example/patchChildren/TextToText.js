import { ref, h } from "../../lib/guide-vue.esm.js"

const nextChildren = 'newChildren'
const prevChildren = 'oldChildren'

const TextToText = {
  name: 'TextToText',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return {
      isChange
    }
  },
  render() {
    const self = this;

    return self.isChange === true
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren)
  }
}

export default TextToText
