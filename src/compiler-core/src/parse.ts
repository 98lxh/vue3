import { NodeTypes } from "./ast";


const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParseContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
  const nodes: any[] = [];
  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }
  return nodes
}


function isEnd(context, ancestors) {
  //遇到结束标签
  const s = context.source;
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag || ''
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }

  return !context.source
}


function parseText(context) {
  //获取内容content
  let endIndex = context.source.length
  let endTokens = ['<', '{{']

  for (let i = 0; i < endTokens.length; i++) {
    const endToken = endTokens[i]
    const index = context.source.indexOf(endToken)

    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content: content
  }
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element.tag)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error('缺少结束标签' + element.tag)
  }
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


function startsWithEndTagOpen(source, tag) {
  return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
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
    children,
    type: NodeTypes.ROOT
  }
}


function createParseContext(content: string) {
  return {
    source: content
  }
}
