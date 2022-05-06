import { isString } from "../../shared"
import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  genFunctionPreamble(ast, context)

  const functionName = "render"
  const args = ["_ctx", "_cache"]
  const signature = args.join(",")

  push(`function ${functionName}(${signature}){`)
  push('return ')
  genNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code
  }
}

function genFunctionPreamble(ast, context) {
  const { push } = context
  const VueBinging = "Vue"
  const aliasHelper = (s: string) => `${helperMapName[s]}: _${helperMapName[s]}`
  push(`const { ${ast.helpers.map(aliasHelper)} } = ${VueBinging}; `)
  push("\n")
  push("return ")
}


function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterPolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.ElEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
  }
}

function genCompoundExpression(node, context) {
  const children = node.children
  const { push } = context
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}

//生成元素节点代码
function genElement(node, context) {
  const { push, helper } = context
  const { tag, children, props } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullable([tag, children, props]), context)
  push(')')
}

function genNodeList(nodes, context) {
  console.log(nodes)
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node)) {
      push(node)
    } else {
      genNode(node, context)
    }

    if (i < nodes.length - 1) {
      push(", ")
    }
  }
}

function genNullable(args) {
  return args.map(arg => arg || "null")
}

function genExpression(node, context) {
  const { push } = context;
  push(`${node.content}`)
}

function genInterPolation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

//生成文字节点代码
function genText(node, context) {
  const { push } = context
  push(`'${node.content}'`)
}

//创建上下文
function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    }
  }
  return context
}

