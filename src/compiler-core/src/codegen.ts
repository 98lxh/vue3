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
  }
}


function genElement(node, context) {
  const { push, helper } = context
  const { tag } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}("${tag}"),null,"hi, " + _toDisplayString(_ctx.message)`)
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


function genText(node, context) {
  const { push } = context
  push(`'${node.content}'`)
}


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

