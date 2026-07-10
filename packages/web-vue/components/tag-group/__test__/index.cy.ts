import { h } from 'vue';

import TagGroup from '../index';

describe('TagGroup', () => {
  it('uses responsive maxCount by default and renders options', () => {
    cy.mount(TagGroup, { props: { options: ['Beijing', 'Shanghai', 'Guangzhou'] } });
    cy.get('.sd-tag-group').should('have.class', 'sd-tag-group-responsive');
    cy.get('.sd-tag-group-item').should('exist');
  });

  it('supports a numeric maxCount', () => {
    cy.mount(TagGroup, {
      props: { maxCount: 2, options: ['标签1', '标签2', '标签3', '标签4'] },
    });
    cy.get('.sd-tag-group-inner .sd-tag-group-item').should(($items) => {
      expect($items).to.have.length(3);
      expect($items.eq(0).text()).to.contain('标签1');
      expect($items.eq(1).text()).to.contain('标签2');
      expect($items.eq(2).text()).to.equal('+2');
    });
  });

  it('supports fieldNames', () => {
    cy.mount(TagGroup, {
      props: {
        maxCount: 1,
        options: [{ label: '文档', value: 'doc', text: '文档', id: 'doc' }],
        fieldNames: { label: 'text', value: 'id' },
      },
    });
    cy.contains('文档').should('exist');
  });

  it('supports a custom item slot', () => {
    cy.mount(TagGroup, {
      props: { maxCount: 1, options: [{ label: '帮助文档', value: 'doc', href: '/docs' }] },
      slots: {
        item: ({ data, itemClass, itemStyle }: any) =>
          h(
            'a',
            { class: ['custom-item', itemClass], style: itemStyle, href: data.href },
            `跳转:${data.label}`,
          ),
      },
    });
    cy.get('a.custom-item').should('have.attr', 'href', '/docs').and('have.text', '跳转:帮助文档');
  });

  it('supports a custom counter slot independent from the item slot', () => {
    cy.mount(TagGroup, {
      props: { maxCount: 1, options: ['标签1', '标签2', '标签3'] },
      slots: {
        item: ({ data, itemClass }: any) =>
          h('span', { class: ['custom-item', itemClass] }, data.label),
        counter: ({ hiddenCount, counterClass }: any) =>
          h('span', { class: ['custom-counter', counterClass] }, `更多:${hiddenCount}`),
      },
    });
    cy.get('.custom-item').should('have.text', '标签1');
    cy.get('.custom-counter').should('have.text', '更多:2');
    cy.get('.custom-counter .sd-ellipsis').should('not.exist');
  });
});
