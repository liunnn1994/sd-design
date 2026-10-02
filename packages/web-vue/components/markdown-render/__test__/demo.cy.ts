import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';
import { getMarkdown, parseMarkdownToStructure } from '../../index';
const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/markdown-render/*.vue',
);
runDemoTests('markdown-render', demos, (name) => {
  if (name === 'upstream') {
    cy.get('.markstream-vue pre').should('contain.text', '临江仙·滚滚长江东逝水');
    cy.get('.sd-markdown-render').should('contain.text', '白发渔樵江渚上');
    return;
  }
  cy.get('.sd-markdown-render').should('be.visible');
  if (name === 'basic') {
    cy.get('.sd-image img').should('be.visible');
    cy.get('.sd-alert').should('have.length', 4);
    cy.get('dl dt').should('contain.text', 'Markdown');
    cy.get('.sd-markdown-render .sd-btn').should('contain.text', 'SD 内容按钮');
    cy.get('@vue').then(({ wrapper }) => {
      const renderers = wrapper.findAllComponents({ name: 'MarkdownRender' });
      const types = new Set<string>();
      const inspect = (value: unknown) => {
        if (Array.isArray(value)) {
          value.forEach(inspect);
          return;
        }
        if (!value || typeof value !== 'object') return;
        const record = value as Record<string, unknown>;
        if (typeof record.type === 'string') types.add(record.type);
        Object.values(record).forEach(inspect);
      };
      renderers.forEach((renderer) =>
        inspect(
          renderer.props('nodes') ??
            parseMarkdownToStructure(renderer.props('content'), getMarkdown(), { final: true }),
        ),
      );
      const expected = [
        'heading',
        'paragraph',
        'text',
        'strong',
        'emphasis',
        'strikethrough',
        'highlight',
        'insert',
        'subscript',
        'superscript',
        'inline_code',
        'hardbreak',
        'link',
        'image',
        'list',
        'list_item',
        'checkbox',
        'checkbox_input',
        'table',
        'table_row',
        'table_cell',
        'thematic_break',
        'blockquote',
        'footnote',
        'footnote_reference',
        'footnote_anchor',
        'admonition',
        'vmr_container',
        'html_inline',
        'html_block',
        'definition_list',
        'definition_item',
        'emoji',
        'reference',
        'math_inline',
        'math_block',
        'code_block',
      ];
      expect(
        expected.filter((type) => !types.has(type)),
        '基础示例遗漏的节点',
      ).to.deep.equal([]);
    });
  }
  if (name === 'streaming') {
    cy.contains('button', '追加内容').click();
    cy.get('.sd-markdown-render strong').should('contain.text', '滚滚长江东逝水');
    cy.get('.sd-tag').should('contain.text', '1/6').and('contain.text', '传输中');
    for (let i = 0; i < 5; i++) cy.contains('button', '追加内容').click();
    cy.contains('button', '追加内容').should('be.disabled');
    cy.get('.sd-markdown-render').should('contain.text', '古今多少事，都付笑谈中');
    cy.get('.sd-markdown-render table').should('contain.text', '一壶浊酒喜相逢');
    cy.get('.sd-markdown-render pre').should('contain.text', 'author: "杨慎"');
    cy.get('.sd-tag').should('contain.text', '6/6').and('contain.text', '传输完成');
    cy.contains('button', '重置').click();
    cy.get('.sd-markdown-render table').should('not.exist');
    cy.contains('button', '追加内容').should('not.be.disabled');
    cy.get('.sd-tag').should('contain.text', '0/6');
  }
  if (name === 'theme') {
    cy.contains('button', '切换主题').click();
    cy.get('.sd-markdown-render').should('have.class', 'dark');
  }
  if (name === 'custom') {
    cy.get('.markdown-custom-code').should('have.length', 2);
    cy.contains('button', '查看节点信息').click();
    cy.get('.sd-alert').should('contain.text', '语言：typescript');
    cy.contains('button', '收起节点信息').click();
    cy.get('.sd-alert').should('not.exist');
  }
  if (name === 'html') {
    cy.get('.sd-markdown-render .sd-btn').should('contain.text', '内容按钮');
    cy.contains('label', 'safe · 安全清理').click();
    cy.get('.sd-markdown-render .sd-btn').should('not.exist');
    cy.get('.sd-markdown-render h2').should('contain.text', '临江仙');
    cy.contains('label', 'escape · 显示源码').click();
    cy.get('.sd-markdown-render').should('contain.text', '<h2>临江仙');
  }
  if (name === 'long-document') {
    cy.get('@vue').then(({ wrapper }) => {
      const renderer = wrapper.findComponent({ name: 'MarkdownRender' });
      cy.spy(renderer.vm.$.exposed!, 'forceMeasure').as('forceMeasure');
    });
    cy.contains('button', '重新测量').click();
    cy.get('@forceMeasure').should('have.been.calledOnce');
    const scroll = () => cy.get('.long-doc-scroll');
    const mounted = (root: HTMLElement) => ({
      slots: root.querySelectorAll('.node-slot').length,
      nested: root.querySelectorAll('.markdown-renderer .markdown-renderer').length,
    });
    // 虚拟化必须真的收敛挂载规模，且不得出现嵌套渲染器。
    scroll().should(($root) => {
      const stats = mounted($root[0]);
      expect(stats.slots, '挂载节点数').to.be.greaterThan(0).and.to.be.at.most(200);
      expect(stats.nested, '嵌套渲染器').to.equal(0);
    });
    cy.contains('第 1 节').should('exist');
    // 切到上游原生引擎，挂载规模应与 SD 封装一致。
    scroll().then(($root) => {
      const sd = mounted($root[0]);
      cy.contains('label', '上游原生').click();
      cy.wait(600);
      cy.get('.long-doc-scroll').should(($next) => {
        const upstream = mounted($next[0]);
        expect(upstream.slots, '上游挂载节点数').to.equal(sd.slots);
        expect(upstream.nested, '上游嵌套渲染器').to.equal(0);
      });
    });
  }
});
