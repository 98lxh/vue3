import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING } from "./runtimeHelpers"

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  //遍历 深度优先搜索
  traversNode(root, context)

  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}


function createRootCodegen(root) {
  root.codegenNode = root.children[0]
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
  }
  return context
}

function traversNode(node, context) {
  const nodeTransforms = context.nodeTransforms

  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    transform(node, context)
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ElEMENT:
      traversChildren(node, context)
      break
  }
}

function traversChildren(node, context) {
  const children = node.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traversNode(node, context)
    }
  }
}
