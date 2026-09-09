import { h, ref } from 'vue';

import Divider from '../index';

describe('Divider dynamic state', () => {
  for (const direction of ['horizontal', 'vertical'] as const) {
    it(`honors zero size and restores the default for ${direction}`, () => {
      const border = direction === 'horizontal' ? 'border-bottom-width' : 'border-left-width';
      cy.mount(Divider, { props: { direction, size: 0, margin: 0 } });
      cy.get('.sd-divider').should('have.css', border, '0px');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ size: 4 }));
      cy.get('.sd-divider').should('have.css', border, '4px');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ size: undefined }));
      cy.get('.sd-divider').should('have.css', border, '1px');
    });
  }

  it('updates the accessible orientation with its direction', () => {
    cy.mount(Divider, { props: { direction: 'vertical' } });
    cy.get('[role="separator"]').should('have.attr', 'aria-orientation', 'vertical');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ direction: 'horizontal' }));
    cy.get('[role="separator"]').should('have.attr', 'aria-orientation', 'horizontal');
  });

  it('reacts to adding and removing text slots', () => {
    const text = ref(false);
    cy.mount({
      render: () =>
        h('div', [
          h(
            'button',
            {
              onClick: () => {
                text.value = !text.value;
              },
            },
            'Toggle',
          ),
          h(Divider, {}, text.value ? { default: () => 'Label' } : {}),
        ]),
    });
    cy.get('.sd-divider-text').should('not.exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-divider-text').should('have.text', 'Label');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-divider-text').should('not.exist');
    cy.get('.sd-divider').should('not.have.class', 'sd-divider-with-text');
  });
});
