import { ref, h } from "../../lib/guide-vue.esm.js"

//1.左侧对比
//(a,b) c
//(a,b) d e
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
// ]
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
//   h('div', { key: 'E' }, 'E'),
// ]

//2.右侧对比
//a (b c)
//d e (b c)
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
// ]
// const nextChildren = [
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
// ]


//3-1.新的比旧的长 右侧
//   创建新的
//(a b)
//(a b) c d
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
// ]
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
//   h('div', { key: 'D' }, 'D'),
// ]


//3-2.新的比旧的长 左侧
//   创建新的
//(a b)
//d c (a b)
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
// ]
// const nextChildren = [
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'C' }, 'C'),
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
// ]

//4-1.老的比新的长 左侧
//   删除老的
//(a b) c
//(a b) 
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
// ]
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
// ]


//4-1.老的比新的长 左侧
//   删除老的
//a (b c)
//(b c) 
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
// ]
// const nextChildren = [
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
// ]

//5-1 乱序
//a,b,(c,d),f,g
//a,b,(e,c),f,g
//d节点在新节点里没有需要删除
//c节点props发生了改变 
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C', id: 'c-prev' }, 'C'),
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ]
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'C', id: 'c-next' }, 'C'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ]


//5-1-1 乱序优化
//a,b,(c,d,e),f,g
//a,b,(e,c),f,g
//这里中间部分是老的比新的多 那么多出来的节点可以直接删除(优化)
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C', id: 'c-prev' }, 'C'),
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ]
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'C', id: 'c-next' }, 'C'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ]

//5-1-2 乱序(移动节点)
//a,b,(c,d,e),f,g
//a,b,(e,c,d),f,g
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C', id: 'c-prev' }, 'C'),
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ]
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'C', id: 'c-next' }, 'C'),
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ]


//5-2 乱序(创建新的节点)
//a,b,(c,e),f,g
//a,b,(e,c,d),f,g
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C', id: 'c-prev' }, 'C'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ]
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'C', id: 'c-next' }, 'C'),
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ]

//综合
//a,b,(c,d,e,z),f,g
//a,b,(d,c,y,e),f,g
const prevChildren = [
  h('div', { key: 'A' }, 'A'),
  h('div', { key: 'B' }, 'B'),
  h('div', { key: 'C', id: 'c-prev' }, 'C'),
  h('div', { key: 'D' }, 'D'),
  h('div', { key: 'E' }, 'E'),
  h('div', { key: 'Z' }, 'Z'),
  h('div', { key: 'F' }, 'F'),
  h('div', { key: 'G' }, 'G'),
]
const nextChildren = [
  h('div', { key: 'A' }, 'A'),
  h('div', { key: 'B' }, 'B'),
  h('div', { key: 'D' }, 'D'),
  h('div', { key: 'C', id: 'c-next' }, 'C'),
  h('div', { key: 'Y' }, 'Y'),
  h('div', { key: 'E' }, 'E'),
  h('div', { key: 'F' }, 'F'),
  h('div', { key: 'G' }, 'G'),
]
const ArrayToArray = {
  name: 'ArrayToArray',
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

export default ArrayToArray
