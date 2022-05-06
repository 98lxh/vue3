import { createVNodeCall, NodeTypes } from "../ast";

export function transformElement(node, context) {
  return () => {
    if (node.type === NodeTypes.ElEMENT) {
      //中间处理层
      //tag
      const vnodeTag = `'${node.tag}'`
      //props
      let vnodeProps;
      //children
      const children = node.children;
      let vnodeChildren = children[0]

      const vnodeElement = {
        type: NodeTypes.ElEMENT,
        tag: vnodeTag,
        props: vnodeProps,
        children: vnodeChildren
      }

      node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren)
    }
  }
}
