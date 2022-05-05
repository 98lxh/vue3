import { NodeTypes } from "../src/ast";
import { baseParse } from "./../src/parse";

describe('Parse', () => {
  describe('interpolation', () => {
    test('simple interpolation', () => {
      const ast = baseParse('{{ message }}')

      //root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message'
        }
      })
    })
  })

  describe('element', () => {
    it('simple element div', () => {
      const ast = baseParse('<div></div>')
      //root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ElEMENT,
        tag: 'div',
        children: []
      })
    })
  })

  describe('text', () => {
    it('simple text', () => {
      const ast = baseParse('some text')

      //root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some text'
      })
    })
  })

  test('hello world', () => {
    const ast = baseParse('<p>hi,{{message}}</p>')
    //root
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ElEMENT,
      tag: 'p',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'hi,'
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  test('Nested element', () => {
    const ast = baseParse('<div><p>hi,</p>{{message}}</div>')
    //root
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ElEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.ElEMENT,
          tag: 'p',
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hi,'
            }
          ]
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  test('should throw error when lack end tag', () => {
    expect(() => {
      baseParse('<div><span></div>')
    }).toThrowError('缺少结束标签span')
  })
})
