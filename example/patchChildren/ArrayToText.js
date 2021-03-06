import { ref, h } from "../../lib/guide-vue.esm.js"

const nextChildren = 'newChildren'
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'b')]

const ArrayToText = {
  name: 'ArrayToText',
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

export default ArrayToText
