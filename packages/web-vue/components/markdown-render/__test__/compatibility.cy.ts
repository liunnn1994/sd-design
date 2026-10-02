import { defineComponent, h, ref } from 'vue';

import type { MarkdownRenderInstance } from '..';
import type { CodeBlockNodeProps, NodeRendererProps } from '../../index';

import {
  MarkdownRender,
  Button,
  setCustomComponents,
  getCustomNodeComponents,
  removeCustomComponents,
  UpstreamMarkdownRender,
} from '../../index';

const props: NodeRendererProps = { content: '## 来源文本', final: true };
const code: CodeBlockNodeProps['node'] = {
  type: 'code_block',
  code: 'const a = 1',
  language: 'js',
  raw: '```js\nconst a = 1\n```',
};

describe('MarkdownRender 兼容性', () => {
  it('nodes 优先于 content，空内容可用', () => {
    cy.mount(MarkdownRender, {
      props: {
        ...props,
        nodes: [
          {
            type: 'paragraph',
            raw: '节点内容',
            children: [{ type: 'text', content: '节点内容', raw: '节点内容' }],
          },
        ],
      },
    });
    cy.get('.sd-markdown-render')
      .should('contain.text', '节点内容')
      .and('not.contain.text', '来源文本');
  });
  it('HTML 嵌套标题和按钮适配，内联事件不执行', () => {
    cy.mount(MarkdownRender, {
      props: {
        htmlPolicy: 'trusted',
        content:
          '<div><h2 id="html-title">HTML 标题</h2><button type="submit" onclick="throw Error(1)">提交</button><button disabled="false">可用</button></div>',
        final: true,
      },
    });
    cy.get('#html-title').should('have.class', 'sd-typography').and('have.prop', 'tagName', 'H2');
    cy.contains('button', '提交')
      .should('have.class', 'sd-btn')
      .and('have.attr', 'type', 'submit')
      .and('not.have.attr', 'onclick');
    cy.contains('button', '可用').should('not.be.disabled');
  });
  it('块级 HTML 不被包进行内宿主标签', () => {
    cy.mount(MarkdownRender, {
      props: {
        htmlPolicy: 'trusted',
        content: '<p id="html-p">块级段落</p><a id="html-a" href="#t">链接</a>',
        final: true,
      },
    });
    // 宿主标签按实际内容选：出现块级标签时用 div，避免 <span><p> 这类非法嵌套。
    cy.get('#html-p').should(($node) => {
      expect($node[0].parentElement?.tagName.toLowerCase()).to.not.equal('span');
      expect($node[0].parentElement?.className).to.not.contain('span');
    });
    cy.get('#html-a').should(($node) => {
      expect($node[0].parentElement?.tagName.toLowerCase()).to.not.equal('span');
    });
  });
  it('行内 HTML 的块级根与嵌套块级内容使用 div 宿主', () => {
    for (const html of [
      '<blockquote id="block-root"><p>引用</p></blockquote>',
      '<ul id="block-root"><li><p>列表</p></li></ul>',
      '<section id="block-root"><p>章节</p></section>',
      '<span id="block-root"><p>嵌套块级段落</p></span>',
    ]) {
      cy.mount(MarkdownRender, {
        props: {
          nodes: [{ type: 'html_inline', content: html, raw: html }],
          htmlPolicy: 'trusted',
          final: true,
        },
      });
      cy.get('#block-root').should(($root) =>
        expect($root[0].parentElement?.tagName).to.equal('DIV'),
      );
    }
  });
  it('HTML 实体按文本和属性语义解码，编码标签不变成 DOM', () => {
    for (const htmlPolicy of ['safe', 'trusted'] as const) {
      cy.mount(MarkdownRender, {
        props: {
          htmlPolicy,
          final: true,
          content:
            '<p id="html-entities" title="甲 &amp; 乙">&amp; &lt; &#x4E2D; &#25991; &nbsp; \\* &lt;img src=x onerror=alert(1)&gt; &amp;lt;</p>',
        },
      });
      cy.get('#html-entities')
        .should('have.text', '& < 中 文 \u00a0 \\* <img src=x onerror=alert(1)> &lt;')
        .and('have.attr', 'title', '甲 & 乙');
      cy.get('#html-entities img').should('not.exist');
    }
  });
  it('实体解码后的危险链接仍被安全策略清理', () => {
    cy.mount(MarkdownRender, {
      props: {
        final: true,
        content: '<p><a id="entity-link" href="java&#x73;cript:alert(1)">链接</a></p>',
      },
    });
    cy.get('#entity-link').should('not.have.attr', 'href');
  });
  it('mini Button 的尺寸不受 Markdown 基础样式覆盖', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h(Button, { size: 'mini', id: 'outside' }, () => '按钮'),
            h(MarkdownRender, { content: '<button>按钮</button>', final: true }),
            h('div', { class: 'sd-markdown-render markstream-vue' }, [
              h(Button, { size: 'mini', id: 'inside' }, () => '按钮'),
            ]),
          ]),
      }),
    );
    cy.get('#outside').then(($outside) => {
      const expected = getComputedStyle($outside[0]);
      const metrics = ['fontSize', 'height', 'padding', 'lineHeight'] as const;
      const values = metrics.map((metric) => expected[metric]);
      cy.get('#inside').should(($inside) => {
        const actual = getComputedStyle($inside[0]);
        metrics.forEach((metric, index) => expect(actual[metric], metric).to.equal(values[index]));
      });
    });
  });
  it('包级 API 使用同一注册表，实例六个方法可调用', () => {
    const id = 'sd-markdown-code-test';
    setCustomComponents(id, {
      code_block: defineComponent({ setup: () => () => h('pre', '调用方代码') }),
    });
    expect(Boolean(getCustomNodeComponents(id).code_block)).to.equal(true);
    const renderer = ref<MarkdownRenderInstance | null>(null);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(MarkdownRender, { ref: renderer, nodes: [code], customId: id, final: true }),
      }),
    );
    cy.contains('pre', '调用方代码')
      .then(() => {
        expect(renderer.value?.getVirtualMetrics()).to.have.property('nodeCount');
        const state = renderer.value?.captureVirtualState();
        expect(state).to.have.property('metrics');
        if (state) renderer.value?.restoreVirtualState(state);
        renderer.value?.scrollToNode(0);
        return renderer.value?.forceMeasure();
      })
      .then(() => renderer.value?.settle({ frames: 1, timeoutMs: 100 }))
      .then(() => removeCustomComponents(id));
  });
  it('click 只转发一次，宿主属性落在渲染容器', () => {
    const click = cy.stub().as('click');
    cy.mount(MarkdownRender, {
      props: { content: '[链接](#target)', final: true, onClick: click },
      attrs: { 'id': 'markdown-host', 'aria-label': '正文', 'data-owner': 'test' },
    });
    cy.get('#markdown-host')
      .should('have.attr', 'aria-label', '正文')
      .and('have.attr', 'data-owner', 'test');
    cy.get('#markdown-host .sd-link').click();
    cy.get('@click').should('have.been.calledOnce');
  });
  it('上游直接组件可从 SD 包导入', () => {
    cy.mount(UpstreamMarkdownRender, { props: { content: '# 原渲染器', final: true } });
    cy.get('h1').should('contain.text', '原渲染器').and('not.have.class', 'sd-typography');
  });
});

describe('MarkdownRender 节点事件转发', () => {
  const fixtures = [
    ['标题', '## [链接](#target)'],
    ['段落', '[链接](#target)'],
    ['引用', '> [链接](#target)'],
    ['提示块', ':::warning 提示\n[链接](#target)\n:::'],
    ['HTML', '<div><a href="#target">链接</a></div>'],
  ];
  for (const [name, content] of fixtures) {
    for (const renderAsFragment of [false, true]) {
      it(`${name} 在 fragment=${renderAsFragment} 时恰好转发一次鼠标事件`, () => {
        const payloads: unknown[][] = [];
        cy.mount(MarkdownRender, {
          props: {
            content,
            final: true,
            renderAsFragment,
            showTooltips: false,
            onClick: (...args: unknown[]) => payloads.push(args),
            onMouseover: cy.stub().as('nodeMouseover'),
            onMouseout: cy.stub().as('nodeMouseout'),
          },
        });
        cy.contains('a', '链接')
          .trigger('mouseover')
          .trigger('mouseout')
          .trigger('click', { eventConstructor: 'MouseEvent' });
        cy.get('@nodeMouseover').should('have.been.calledOnce');
        cy.get('@nodeMouseout').should('have.been.calledOnce');
        // 两种模式各走一条互斥的委托路径，都只发一次：普通模式由渲染器根容器冒泡转发，
        // fragment 模式由节点组件自身转发。任一路径被重复绑定，这里都会变成多次。
        cy.then(() => {
          expect(payloads).to.have.length(1);
          expect(payloads[0][0]).to.be.instanceOf(MouseEvent);
          // referenceId 由引用节点自身补充，DOM 点击不携带，普通链接为 undefined。
          expect(payloads[0][1]).to.equal(undefined);
        });
        cy.get('[oncopy], [onhandleartifactclick]').should('not.exist');
      });
    }
  }
});
