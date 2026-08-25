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

  it('collapses to the counter when a single option exceeds the container width', () => {
    const longLabel = 'AVeryLongLabelWithoutBreakOpportunityThatExceedsAnyNarrowContainerWidth';
    cy.mount({
      components: { TagGroup },
      template: `
        <div style="width: 120px; overflow: hidden;">
          <TagGroup :options="options" />
        </div>
      `,
      data: () => ({ options: [longLabel, 'B', 'C'] }),
    });
    cy.get('.sd-tag-group-inner').should('have.attr', 'role', 'list');
    cy.get('.sd-tag-group-item:visible').should(($items) => {
      const texts = $items.map((_i, el) => Cypress.$(el).text()).get();
      expect(
        texts.some((text) => text.includes(longLabel)),
        'oversized item is hidden',
      ).to.equal(false);
      expect(
        texts.some((text) => /^\+\d+$/.test(text)),
        'counter appears',
      ).to.equal(true);
      expect($items.toArray().every((item) => item.getAttribute('role') === 'listitem')).to.equal(
        true,
      );
    });
  });

  it('keeps items on one line in responsive mode and shows gap between tags', () => {
    cy.mount({
      components: { TagGroup },
      template: `
        <div style="width: 300px;">
          <TagGroup :options="options" />
        </div>
      `,
      data: () => ({ options: ['北京', '上海', '广州'] }),
    });
    cy.get('.sd-tag-group-inner > [data-part="content"]').should(($inner) => {
      const style = getComputedStyle($inner[0]);
      expect(Number.parseFloat(style.columnGap), 'gap is applied').to.be.greaterThan(0);
      const visibleItems = $inner.children('[data-part="item"]:visible').toArray();
      const top = visibleItems[0].getBoundingClientRect().top;
      visibleItems.forEach((item) => {
        expect(item.getBoundingClientRect().top, 'all items on one line').to.equal(top);
      });
    });
  });

  it('updates the responsive counter after options change', () => {
    cy.mount({
      components: { TagGroup },
      template: `
        <div style="width: 120px;">
          <TagGroup :options="options" />
          <button class="append-option" @click="options.push('four')">append</button>
        </div>
      `,
      data: () => ({ options: ['one', 'two', 'three'] }),
    });

    cy.get('.sd-tag-group-item-counter:visible').should('have.text', '+1');
    cy.get('.append-option').click();
    cy.get('.sd-tag-group-inner [data-part="item"]:visible').should('have.length', 2);
    cy.get('.sd-tag-group-item-counter:visible').should('have.text', '+2');
  });
});
