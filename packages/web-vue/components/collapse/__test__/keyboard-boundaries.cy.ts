import { h } from 'vue';

import Collapse, { CollapseItem } from '../index';

describe('Collapse nested keyboard controls', () => {
  it('leaves Enter in a header input to the input', () => {
    cy.mount(() =>
      h(Collapse, null, {
        default: () =>
          h(
            CollapseItem,
            { key: 'one' },
            {
              header: () => h('input', { placeholder: 'Edit title' }),
              default: () => 'Body',
            },
          ),
      }),
    );
    cy.get('input').focus().trigger('keydown', { key: 'Enter' });
    cy.get('.sd-collapse-item-header').should('have.attr', 'aria-expanded', 'false');
  });
});
