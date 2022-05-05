import { NodeTypes } from "./ast";


const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParseContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any[] = [];
  let node
  const s = context.source
  if (s.startsWith('{{')) {
    node = parseInterpolation(context)
  } else if (s[0] === '<') {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
  }


  if (!node) {
    node = parseText(context)
  }

  nodes.push(node)
  return nodes
}


function parseText(context) {
  //获取内容content
  const content = parseTextData(context, context.source.length)

  return {
    type: NodeTypes.TEXT,
    content: content
  }
}

function parseElement(context) {
  const element = parseTag(context, TagType.Start)

  parseTag(context, TagType.End)
  console.log(context.source)
  return element
}


function parseTag(context, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  advance(context, match[0].length)
  advance(context, 1)

  if (type === TagType.End) return

  return {
    type: NodeTypes.ElEMENT,
    tag: tag
  }
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
  const rawcontent = parseTextData(context, rawContentLength)
  const content = rawcontent.trim()

  advance(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function parseTextData(context, length) {
  const content = context.source.slice(0, length)

  advance(context, content.length)

  return content
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
