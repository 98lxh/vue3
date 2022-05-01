import { h, provide, inject, createTextVnode } from "../../lib/guide-vue.esm.js"

export const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', "fooTwo")
    const foo = inject('foo')

    return {
      foo
    }
  },
  render() {
    return h('div', {}, [h('p', {}, 'ProviderTwo foo:' + this.foo), h(Consumer)])
  }
}

const Consumer = {
  name: 'Cursumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    //default value
    const baz = inject('baz', 'baz defaultValue')
    const funBaz = inject('baz', () => 'baz fun')

    return {
      foo,
      bar,
      baz,
      funBaz
    }
  },
  render() {
    return h('div', {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.funBaz}`)
  }
}


export default {
  name: 'App',
  setup() { },
  render() {
    return h('div', {}, [createTextVnode("provide/inject"), h(Provider)])
  }
}
