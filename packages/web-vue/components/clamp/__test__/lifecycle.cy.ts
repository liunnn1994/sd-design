import { defineComponent, h, shallowRef } from 'vue';

import { LineClamp, RichLineClamp, WrapClamp, type WrapClampSlotProps } from '../index';

const items = Array.from({ length: 6 }, (_, index) => `Item ${index + 1}`);
const renderItem = ({ item }: { item: string }) =>
  h('span', { style: { display: 'inline-block', width: '60px', height: '24px' } }, item);
const visibleItems = () => cy.get('[data-part="item"]').not('[aria-hidden="true"]');

describe('Clamp recalculation', () => {
  for (const component of [LineClamp, RichLineClamp]) {
    it(`${component.name} recalculates after content replacement`, () => {
      const contentKey = component === LineClamp ? 'text' : 'html';
      const change = cy.spy().as('change');
      cy.mount(component, {
        props: { [contentKey]: 'Long text '.repeat(30), maxLines: 1, onClampchange: change },
        attrs: { style: 'width:150px' },
      });
      cy.get('@change').should('have.been.calledWith', true);
      cy.then(() => change.resetHistory());
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [contentKey]: 'Short' }));
      cy.get('@change').should('have.been.calledWith', false);
      cy.get('[data-part="body"]').should('contain.text', 'Short');
    });
  }

  it('recalculates when its container grows', () => {
    const change = cy.spy().as('change');
    cy.mount({
      render: () =>
        h('div', { id: 'clamp-container', style: 'width:80px' }, [
          h(LineClamp, {
            text: 'A line of text that fits after resizing',
            maxLines: 1,
            onClampchange: change,
          }),
        ]),
    });
    cy.get('@change').should('have.been.calledWith', true);
    cy.then(() => change.resetHistory());
    cy.get('#clamp-container').invoke('css', 'width', '1000px');
    cy.get('@change').should('have.been.calledWith', false);
  });

  it('removes obsolete WrapClamp items when the list is replaced', () => {
    cy.mount(WrapClamp, {
      props: { items: ['Old A', 'Old B'], expanded: true },
      slots: { item: ({ item }: { item: string }) => item },
    });
    cy.get('[data-part="item"]').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ items: ['New'] }));
    cy.get('[data-part="item"]').should('have.length', 1).and('have.text', 'New');
  });

  it('recomputes visible WrapClamp items and the hidden count after widening and replacement', () => {
    const width = shallowRef(150);
    const currentItems = shallowRef(items);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', { style: { width: `${width.value}px` } }, [
            h(
              WrapClamp,
              { 'items': currentItems.value, 'maxLines': 1, 'data-testid': 'wrap' },
              {
                item: renderItem,
                after: ({ hiddenItems }: WrapClampSlotProps<string>) =>
                  `Hidden ${hiddenItems.length}`,
              },
            ),
          ]),
      }),
    );
    visibleItems().should('have.length', 1);
    cy.get('[data-part="after"]').should('have.text', 'Hidden 5');
    cy.then(() => {
      width.value = 500;
    });
    cy.get('[data-testid="wrap"]').should('have.css', 'width', '500px');
    visibleItems().should('have.length', 6);
    cy.get('[data-part="after"]').should('have.text', 'Hidden 0');
    cy.then(() => {
      currentItems.value = ['New A', 'New B'];
    });
    cy.get('[data-part="item"]').should('have.length', 2).and('have.text', 'New ANew B');
    cy.get('[data-part="after"]').should('have.text', 'Hidden 0');
  });

  it('holds controlled WrapClamp expansion until the parent accepts its request', () => {
    const request = cy.spy().as('expand-request');
    cy.mount(WrapClamp, {
      props: { 'items': items, 'maxLines': 1, 'expanded': false, 'onUpdate:expanded': request },
      attrs: { style: 'width:150px' },
      slots: {
        item: renderItem,
        after: ({ expand, hiddenItems }: WrapClampSlotProps<string>) =>
          h('button', { onClick: expand }, `Expand (${hiddenItems.length})`),
      },
    });
    cy.get('[data-part="after"] button').should('have.text', 'Expand (5)').click();
    cy.get('@expand-request').should('have.been.calledOnceWithExactly', true);
    visibleItems().should('have.length', 1);
    cy.get('[data-part="after"] button').should('have.text', 'Expand (5)');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ expanded: true }));
    visibleItems().should('have.length', 6);
    cy.get('[data-part="after"] button').should('have.text', 'Expand (0)');
  });

  it('moves the existing keyed WrapClamp item nodes when the expanded list is reordered', () => {
    cy.mount(WrapClamp, {
      props: { items, expanded: true, itemKey: (item: string) => item },
      slots: { item: renderItem },
    });
    cy.get('[data-part="item"]')
      .first()
      .should('have.text', 'Item 1')
      .then(([$first]) => {
        cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ items: [...items].reverse() }));
        cy.get('[data-part="item"]')
          .last()
          .should(($last) => {
            expect($last[0]).to.equal($first);
            expect($last.text()).to.equal('Item 1');
          });
      });
  });
});
