import { h, ref } from 'vue';

import { TypographyParagraph } from '../index';

describe('Typography formatting with ellipsis', () => {
  it('preserves mark and code nesting when ellipsis is enabled', () => {
    const ellipsis = ref(false);
    cy.mount({
      setup: () => () =>
        h(
          TypographyParagraph,
          { ellipsis: ellipsis.value, code: true, mark: true },
          { default: () => 'Formatted text' },
        ),
    });
    cy.get('.sd-typography mark > code').should('have.text', 'Formatted text');
    cy.then(() => {
      ellipsis.value = true;
    });
    cy.get('.sd-typography [data-part="content"] mark > code').should(
      'contain.text',
      'Formatted text',
    );
  });
});
