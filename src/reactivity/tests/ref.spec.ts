import { effect } from "../effect"
import { reactive } from "../reactive"
import { ref, isRef, unRef, proxyRefs } from "../ref"

describe("ref", () => {
  it("happy path", () => {
    const num = ref(1)
    expect(num.value).toBe(1)
  })

  it("should be reactive", () => {
    const num = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = num.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    num.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)

    //same value should not trigger
    num.value = 2;
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it("should make nested properties reactive", () => {
    const num = ref({
      count: 1
    })
    let dummy
    effect(() => {
      dummy = num.value.count
    })
    expect(dummy).toBe(1)
    num.value.count = 2
    expect(dummy).toBe(2)
  })

  it("isRef", () => {
    const num = ref(1)
    const user = reactive({
      name: 'no hair'
    })
    expect(isRef(num)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(user)).toBe(false)
  })

  it("unRef", () => {
    const num = ref(1)
    const user = reactive({
      name: 'no hair'
    })
    expect(unRef(num)).toBe(1)
    expect(unRef(1)).toBe(1)
  })

  it("proxyRef", () => {
    const user = {
      age: ref(10),
      name: 'liu'
    }

    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('liu')

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)
  })
})
