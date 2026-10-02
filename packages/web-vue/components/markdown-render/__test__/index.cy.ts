import { defineComponent, h, ref } from 'vue';

import {
  MarkdownRender as NativeMarkdown,
  setCustomComponents,
  removeCustomComponents,
} from 'markstream-vue';

import MarkdownRender from '..';
import { ThemeProvider } from '../../index';

describe('MarkdownRender', () => {
  it('显示六级标题、富内联和 SD 链接', () => {
    cy.mount(MarkdownRender, {
      props: {
        content:
          '# 一级\n\n## **加粗** [链接](#target) `代码`\n\n### 三级\n\n#### 四级\n\n##### 五级\n\n###### 六级',
        final: true,
      },
    });
    for (let level = 1; level <= 6; level++) cy.get(`h${level}.sd-typography`).should('exist');
    cy.get('h2 strong').should('contain', '加粗');
    cy.get('h2 .sd-link').should('have.attr', 'href', '#target');
    cy.get('h2 code').should('contain', '代码');
  });
  it('内容更新与 nodes 优先级保持兼容', () => {
    const content = ref('## 初始');
    cy.mount(
      defineComponent({
        setup: () => () => h(MarkdownRender, { content: content.value, final: true }),
      }),
    );
    cy.get('h2')
      .should('contain', '初始')
      .then(() => {
        content.value = '## 更新';
      });
    cy.get('h2').should('contain', '更新');
  });
  it('显式覆盖优先且不污染原生渲染器', () => {
    const custom = defineComponent({
      props: ['node'],
      setup: () => () => h('h2', { class: 'caller-heading' }, '自定义标题'),
    });
    setCustomComponents('sd-test', { heading: custom });
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h(MarkdownRender, { content: '## SD 标题', final: true }),
            h(MarkdownRender, { content: '## 调用方', final: true, customId: 'sd-test' }),
            h(NativeMarkdown, { content: '## 原生标题', final: true }),
          ]),
      }),
    );
    cy.get('.sd-markdown-render h2.sd-typography').should('have.length', 1);
    cy.get('.caller-heading').should('contain', '自定义标题');
    cy.contains('h2', '原生标题')
      .should('not.have.class', 'sd-typography')
      .then(() => removeCustomComponents('sd-test'));
  });
  it('原始 HTML escape 策略不生成交互控件', () => {
    cy.mount(MarkdownRender, {
      props: { content: '<button>原始按钮</button>', htmlPolicy: 'escape', final: true },
    });
    cy.get('.sd-markdown-render').should('contain.text', '<button>');
    cy.get('.sd-markdown-render button').should('not.exist');
  });
  it('任务项保持只读并使用 SD Checkbox', () => {
    cy.mount(MarkdownRender, { props: { content: '- [x] 已完成\n- [ ] 未完成', final: true } });
    cy.get('.sd-checkbox input')
      .should('have.length', 2)
      .first()
      .should('be.checked')
      .and('be.disabled');
  });
  it('引用块保留多段落、嵌套和 SD 引用呈现', () => {
    cy.mount(MarkdownRender, {
      props: {
        content: '> 第一段 **加粗**\n>\n> > 嵌套引用\n>\n> 第二段',
        final: true,
      },
    });
    cy.get('blockquote.sd-typography').should('have.length.at.least', 1);
    cy.get('blockquote.sd-typography').first().should('contain.text', '第一段');
    cy.get('blockquote.sd-typography').first().find('strong').should('contain', '加粗');
    cy.get('blockquote.sd-typography').first().should('contain.text', '第二段');
    cy.get('blockquote.sd-typography blockquote').should('contain.text', '嵌套引用');
  });
  it('提示块使用 SD Alert 并保留子节点', () => {
    cy.mount(MarkdownRender, {
      props: { content: ':::warning 注意\n提示正文 **加粗**\n:::', final: true },
    });
    cy.get('.sd-alert').should('contain.text', '注意').and('contain.text', '提示正文');
    cy.get('.sd-alert strong').should('contain', '加粗');
  });
  it('上游内部回调不落到宿主元素', () => {
    cy.mount(MarkdownRender, { props: { content: '## 标题\n\n> 引用', final: true } });
    cy.get('.sd-markdown-render [oncopy]').should('not.exist');
    cy.get('.sd-markdown-render [onhandleartifactclick]').should('not.exist');
  });
  it('未传 isDark 时保持未传，主题由上游默认值之外的主题来源决定', () => {
    // 回归：SFC 编译器把 `isDark?: boolean` 声明成 Boolean prop，
    // 若不显式写 undefined，Vue 的布尔 casting 会把未传读成 false，主题继承随之失效。
    const mode = ref<'light' | 'dark'>('dark');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeMode: mode.value }, () =>
            h(MarkdownRender, { content: '## 继承', final: true, id: 'cast' }),
          ),
      }),
    );
    cy.get('#cast').should('have.class', 'dark');
  });
});
