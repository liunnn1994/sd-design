import type { CustomComponents } from 'markstream-vue';

import Divider from '../../divider';
import Admonition from './admonition.vue';
import Checkbox from './checkbox.vue';
import Container from './container.vue';
import Html from './html.vue';
import Image from './image.vue';
import InlineCode from './inline-code.vue';
import Link from './link.vue';

// 未列出的键继续使用上游默认节点；原始 HTML 中的 button 由 nodes/html.vue 适配，
// 不需要调用方声明 custom-html-tags，因此这里不注册独立的 button 节点。
//
// `paragraph` 刻意缺席，不要补回。上游 ListItemNode 对列表项里的段落有两条路径：
// 映射表里没有 `paragraph` 键时走轻量行内渲染，直接产出 <p class="paragraph-node">，
// 不创建任何渲染器实例；只要映射表里出现该键（无论映射到哪个组件），它就退化为
// 给每个列表项 spawn 一个完整的嵌套 NodeRenderer。这会让长文档多出约 2/3 的
// node-slot 与 DOM 元素，撑破 maxLiveNodes/liveNodeBuffer 预算，并让嵌套的
// data-node-index 与父级索引空间冲突。`__test__/perf.cy.ts` 用真实文档守住这条边界。
// 段落的观感改由 style/index.scss 里的 .paragraph-node 规则用 SD token 对齐。
export const markdownComponents: Partial<CustomComponents> = {
  admonition: Admonition,
  inline_code: InlineCode,
  heading: Container,
  blockquote: Container,
  link: Link,
  image: Image,
  checkbox: Checkbox,
  checkbox_input: Checkbox,
  thematic_break: Divider,
  html_block: Html,
  html_inline: Html,
};
