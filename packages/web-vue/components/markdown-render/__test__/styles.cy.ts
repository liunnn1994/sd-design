import { defineComponent, h } from 'vue';

import MarkdownRender from '..';
import { TypographyTitle, TypographyParagraph } from '../../index';

const headings = '# 一级\n\n## 二级\n\n### 三级\n\n#### 四级\n\n##### 五级\n\n###### 六级';

describe('Markdown 实际排版样式', () => {
  it('标题使用 Typography 的六级字号，段落保留间距', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h(TypographyTitle, { heading: 1, id: 'standalone-title' }, () => '独立标题'),
            h(TypographyParagraph, { id: 'standalone-paragraph' }, () => '独立段落'),
            h(MarkdownRender, { content: `${headings}\n\n正文段落`, final: true }),
          ]),
      }),
    );
    const sizes = [36, 32, 28, 24, 20, 16];
    sizes.forEach((size, index) => {
      cy.get(`.sd-markdown-render h${index + 1}.sd-typography`).should(
        'have.css',
        'font-size',
        `${size}px`,
      );
    });
    cy.get('#standalone-title').should('have.css', 'font-size', '36px');
    cy.get('#standalone-paragraph').should(($node) => {
      expect(parseFloat(getComputedStyle($node[0]).marginBottom)).to.be.greaterThan(0);
    });
  });

  it('段落排版与 TypographyParagraph 对齐', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h(TypographyParagraph, { id: 'standalone-paragraph' }, () => '独立段落'),
            h(MarkdownRender, { content: '正文段落', final: true }),
          ]),
      }),
    );
    cy.get('#standalone-paragraph').then(($standalone) => {
      const expected = getComputedStyle($standalone[0]);
      const metrics = ['fontSize', 'lineHeight', 'color'] as const;
      const values = metrics.map((metric) => expected[metric]);
      // 段落刻意不注册 SD 组件（见 nodes/index.ts），观感由 .paragraph-node 规则对齐。
      cy.get('.sd-markdown-render .paragraph-node').should(($node) => {
        const actual = getComputedStyle($node[0]);
        metrics.forEach((metric, index) => expect(actual[metric], metric).to.equal(values[index]));
        expect(parseFloat(actual.marginBottom), '段落间距').to.be.greaterThan(0);
      });
    });
  });
  it('列表、引用、表格与富内联保留可见样式', () => {
    cy.mount(MarkdownRender, {
      props: {
        final: true,
        content:
          '## [标题链接](#target)\n\n**加粗** *斜体* ~~删除~~ ==高亮== ++插入++ `代码`\n\n> 引用\n\n- 无序列表\n\n3. 有序列表\n\n| 左 | 中 | 右 |\n| :--- | :---: | ---: |\n| A | B | C |',
      },
    });
    cy.get('h2 .sd-link').should('have.css', 'font-size', '32px');
    cy.get('strong').should(($node) =>
      expect(Number(getComputedStyle($node[0]).fontWeight)).to.be.at.least(600),
    );
    cy.get('em').should('have.css', 'font-style', 'italic');
    cy.get('del').should('have.css', 'text-decoration-line', 'line-through');
    cy.get('ins').should('have.css', 'text-decoration-line', 'underline');
    cy.get('mark').should('not.have.css', 'background-color', 'rgba(0, 0, 0, 0)');
    cy.get('code').should(($node) =>
      expect(getComputedStyle($node[0]).fontFamily).to.match(/mono/i),
    );
    cy.get('blockquote.sd-typography').should(($node) =>
      expect(parseFloat(getComputedStyle($node[0]).borderLeftWidth)).to.be.greaterThan(0),
    );
    cy.get('ul').should('not.have.css', 'list-style-type', 'none');
    cy.get('ol').should('have.css', 'list-style-type', 'decimal');
    cy.get('ol > li').first().should('have.attr', 'value', '3');
    cy.get('td').first().should('have.css', 'text-align', 'left');
    cy.get('td').eq(1).should('have.css', 'text-align', 'center');
    cy.get('td').eq(2).should('have.css', 'text-align', 'right');
    cy.get('th')
      .first()
      .should(($node) =>
        expect(parseFloat(getComputedStyle($node[0]).borderBottomWidth)).to.be.greaterThan(0),
      );
  });
});
