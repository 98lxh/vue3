import { NodeTypes } from "./ast";

export function baseParse(content: string) {

  const context = createParseContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any[] = [];
  let node
  if (context.source.startsWith('{{')) {
    node = parseInterpolation(context)
  }
  nodes.push(node)
  return nodes
}

function parseInterpolation(context) {

  const openDelimiter = '{{'
  const closeDelimiter = '}}'
  //例:{{message}}
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

  //message}}
  advance(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length
  //message
  const rawcontent = context.source.slice(0, rawContentLength)
  const content = rawcontent.trim()

  advance(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function advance(context: any, length: number) {
  context.source = context.source.slice(length)
}


function createRoot(children) {
  return {
    children
  }
}


function createParseContext(content: string) {
  return {
    source: content
  }
}
