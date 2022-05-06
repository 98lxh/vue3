import { NodeTypes } from "./ast"

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  //遍历 深度优先搜索
  traversNode(root, context)

  createRootCodegen(root)
}


function createRootCodegen(root) {
  root.codegenNode = root.children[0]
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
  return context
}

function traversNode(node, context) {
  const children = node.children

  const nodeTransforms = context.nodeTransforms

  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    transform(node)
  }

  traversChildren(children, context)
}

function traversChildren(children, context) {
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traversNode(node, context)
    }
  }
}
