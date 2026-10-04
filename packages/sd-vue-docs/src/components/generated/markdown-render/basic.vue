<template>
  <div class="sd:grid sd:gap-6">
    <MarkdownRender
      :style="completeLayout"
      :content="content"
      final
      :batch-rendering="false"
      :node-virtual="false"
    />
    <MarkdownRender
      :style="completeLayout"
      :nodes="additionalNodes"
      final
      :batch-rendering="false"
      :node-virtual="false"
    />
    <MarkdownRender
      :style="completeLayout"
      :content="engines"
      final
      :batch-rendering="false"
      :node-virtual="false"
    />
    <MarkdownRender :style="completeLayout" :content="preCode" render-code-blocks-as-pre final />
    <MarkdownRender :style="completeLayout" :content="trustedHtml" html-policy="trusted" final />
  </div>
</template>
<script setup lang="ts">
  import { MarkdownRender, setInfographicLoader } from '@sdata/web-vue';

  // mermaid / katex / @terrastruct/d2 由上游在检测到可选 peer 后自动 import，装包即用。
  // infographic 既默认关闭、也没有自动 import 兜底，必须由使用方提供 loader。
  // 这些可选依赖安装在文档站，组件库本身不引入。
  setInfographicLoader(() => import('@antv/infographic'));

  // 格式对照示例使用完整自然高度，避免长内容被浏览器跳过渲染优化截断。
  const completeLayout = { contentVisibility: 'visible', containIntrinsicSize: 'none' } as const;
  const image =
    'data:image/png;base64,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';
  const content = [
    '# Markdown 排版',
    '使用 **SD Design** 展示 [链接](https://example.com "访问示例网站")、`行内代码`与图片。以下覆盖标准 Markdown 与渲染器扩展语法。',
    '## 二级标题 · 内容分区',
    '### 三级标题 · 富内联 **加粗** 与 *斜体*',
    '#### 四级标题',
    '##### 五级标题',
    '###### 六级标题',
    '## 段落与内联格式',
    '**临江仙·滚滚长江东逝水** · *明·杨慎*',
    '滚滚长江东逝水，浪花淘尽英雄。  \n是非成败转头空。青山依旧在，几度夕阳红。',
    '白发渔樵江渚上，惯看秋月春风。  \n一壶浊酒喜相逢。古今多少事，都付笑谈中。',
    '普通文本、**加粗**、*斜体*、***加粗斜体***、~~删除线~~、==高亮==、++插入文本++、H~2~O、x^2^ 和 `const value = 1`。',
    '段落之间保留间距；行末两个空格产生硬换行。  \n这一行紧接上一行。',
    '转义字符：\\*不是斜体\\*、\\#不是标题；实体：&amp; &lt; &gt;。',
    '## 链接与引用',
    '[外部链接](https://example.com "链接提示")、[页内链接](#markdown-basic-target)、[引用式链接][site]、<https://example.com>、<hello@example.com>。',
    '[site]: https://example.com "引用链接"',
    '> 引用包含 **加粗**、[链接](https://example.com) 和 `代码`。\n>\n> 第二个引用段落。\n>\n> > 嵌套引用。',
    '## 列表与任务项',
    '- 无序项目\n  - 嵌套项目\n  - **富文本** 项目\n- 第二个项目',
    '3. 有序编号从 3 开始\n4. 第二步\n   1. 嵌套有序项\n   2. 下一项',
    '- [x] 已完成任务\n- [ ] 待完成任务',
    '## 表格',
    '| 左对齐 | 居中 | 右对齐 |\n| :--- | :---: | ---: |\n| **格式** | `代码` | 128 |\n| [链接](https://example.com) | 多列内容 | 256 |',
    '## 图片与分隔线',
    `![SD Markdown 示例图片](${image} "本地内嵌图片，点击可预览")`,
    '---',
    '## 脚注',
    '正文中的脚注[^note]可以跳转到解释，并从脚注返回。',
    '[^note]: 脚注也支持 **加粗** 和 [链接](https://example.com)。',
    '## 提示块与容器',
    ':::note 说明\n普通提示，保留 **富文本**。\n:::',
    ':::tip 建议\n成功状态提示。\n:::',
    ':::warning 注意\n警告状态提示。\n:::',
    ':::danger 风险\n错误状态提示。\n:::',
    ':::example\n自定义命名容器，内容仍由原节点渲染。\n:::',
    '## 原始 HTML',
    '<h3 id="markdown-basic-target">HTML 标题</h3>\n<p>HTML 段落包含 <a href="https://example.com">链接</a>、<strong>加粗</strong>和 <em>斜体</em>。</p>',
    '行内 HTML：<mark>标记</mark>、<kbd>Ctrl</kbd> + <kbd>C</kbd>、<u>下划线</u>。',
    '## 已解析节点',
    '定义列表、emoji、引用编号与 checkbox_input 等节点通过 nodes API 展示，不将未启用的解析扩展写成默认支持的语法。',
  ].join('\n\n');

  const text = (content: string) => ({ type: 'text', content, raw: content });
  // 部分公开节点是结构节点或 API 节点，不具备独立 Markdown 语法。
  const additionalNodes = [
    {
      type: 'definition_list',
      raw: '',
      items: [
        {
          type: 'definition_item',
          raw: '',
          term: [text('Markdown')],
          definition: [
            {
              type: 'paragraph',
              raw: '',
              children: [text('轻量标记语言，定义项保留语义 dt/dd。')],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      raw: '',
      children: [
        text('Emoji 节点：'),
        { type: 'emoji', raw: '✨', name: 'sparkles', markup: '✨' },
        text('；引用编号：'),
        { type: 'reference', raw: '[1]', id: '1' },
        text('；只读 checkbox_input：'),
        { type: 'checkbox_input', raw: '', checked: true },
        text('；checkbox：'),
        { type: 'checkbox', raw: '', checked: false },
      ],
    },
  ];

  // 数学和图表保留原引擎；未配置可选 peer/loader 时展示其原有降级状态。
  const engines = [
    '## 代码、数学与图表',
    '带语言的代码块（CodeBlockNode）：',
    '```typescript\ninterface User {\n  name: string\n}\nconst user: User = { name: "SD Design" }\n```',
    '缩进代码块：\n\n    const indented = true',
    '行内公式：$E = mc^2$。',
    '$$\n\\int_0^1 x^2\\,dx = \\frac{1}{3}\n$$',
    '### Mermaid',
    '```mermaid\nflowchart LR\n  A[Markdown] --> B[解析节点]\n  B --> C[SD 渲染]\n```',
    '### D2',
    '```d2\nMarkdown -> Parser -> Renderer\n```',
    '### Infographic',
    '```infographic\ninfographic list-row-simple-horizontal-arrow\ndata\n  title Markdown 渲染流程\n  items\n    - label 解析\n      desc 生成节点\n    - label 渲染\n      desc 复用组件\n```',
  ].join('\n\n');
  const trustedHtml = '### 显式信任的 HTML 按钮\n\n<button type="button">SD 内容按钮</button>';
  const preCode = '### 轻量代码节点（PreCodeNode）\n\n```text\n无需高亮运行时的轻量代码展示\n```';
</script>
