import { h, ref, getCurrentInstance, nextTick } from "../../lib/guide-vue.esm.js"

export const App = {
  setup() {
    const count = ref(0);
    const handleClick = () => {
      const root = document.getElementById('root')
      for (let i = 0; i < 100; i++) {
        count.value++
      }

      nextTick(() => {
        console.log(root.innerText)
      })
    }
    return {
      count,
      handleClick
    }
  },
  render() {
    const button = h('button', { onClick: this.handleClick }, "update")
    const p = h('p', {}, 'count:' + this.count)

    return h('div', {
      id: 'root'
    }, [
      button,
      p
    ])
  }
}
