import { h } from 'vue';

import { LineClamp, RichLineClamp, WrapClamp } from '../index';

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
});
