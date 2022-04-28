export const extend = Object.assign

export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal)
}

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}
