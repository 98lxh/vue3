import { h } from "../../lib/guide-vue.esm.js"

export const foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log('emit add')

      emit('add', 1, 2)
      emit('add-foo', 1)
    }

    return {
      emitAdd
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.emitAdd
    }, "emit Add")

    const foo = h('p', {}, 'foo')
    return h('div', {}, [foo, btn])
  }
}
