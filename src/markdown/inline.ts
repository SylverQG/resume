import type {
  Delete,
  Emphasis,
  InlineCode,
  Link,
  PhrasingContent,
  Strong,
  Text,
} from 'mdast'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { defineComponent, h, type VNode } from 'vue'
import { nodesText } from './parse'

const inlineProcessor = unified().use(remarkParse).use(remarkGfm)

/**
 * 行内 Markdown（**加粗** / `代码` / [链接] / *斜体* / ~~删除~~）→ VNode 列表。
 * 直接映射 VNode，不走 innerHTML，无 XSS 面（设计文档 §2.1）。
 */
export function renderInline(source: string): (VNode | string)[] {
  const tree = inlineProcessor.parse(source)
  const first = tree.children[0]
  if (!first || first.type !== 'paragraph') return [source]
  return first.children.map(renderNode)
}

function renderNode(node: PhrasingContent): VNode | string {
  switch (node.type) {
    case 'text':
      return (node as Text).value
    case 'inlineCode':
      return h('code', (node as InlineCode).value)
    case 'strong':
      return h('strong', mapAll((node as Strong).children))
    case 'emphasis':
      return h('em', mapAll((node as Emphasis).children))
    case 'delete':
      return h('del', mapAll((node as Delete).children))
    case 'link':
      return h(
        'a',
        {
          href: (node as Link).url,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        mapAll((node as Link).children),
      )
    case 'break':
      return h('br')
    default:
      // 未知行内节点：按纯文本兜底
      return h('span', nodesText([node]))
  }
}

function mapAll(children: readonly PhrasingContent[]): (VNode | string)[] {
  return children.map(renderNode)
}

/** 模板内直接使用的行内渲染组件：`<RenderInline :source="bullet" />` */
export const RenderInline = defineComponent({
  name: 'RenderInline',
  props: {
    source: { type: String, required: true },
  },
  setup(props) {
    return () => h('span', renderInline(props.source))
  },
})
