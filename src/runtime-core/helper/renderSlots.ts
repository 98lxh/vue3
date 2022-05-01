import { Fragment } from "../renderer";
import { createVnode } from "../vnode";

export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      //作用域插槽
      return createVnode(Fragment, {}, slot(props))
    }
  }
}
