import { h, ref } from 'vue';

import { TypographyParagraph } from '../index';

describe('Typography slot snapshots', () => {
  it('updates a replacement slot closure with new VNode data', () => {
    const text = ref('Original');
    cy.mount({
      setup: () => () => {
        const current = text.value;
        return h(TypographyParagraph, {}, { default: () => h('strong', current) });
      },
    });
    cy.get('.sd-typography strong').should('have.text', 'Original');
    cy.then(() => {
      text.value = 'Updated';
    });
    cy.get('.sd-typography strong').should('have.text', 'Updated');
  });

  it('patches changed slot data while preserving keyed interactive DOM and focus', () => {
    const text = ref('First');
    let input: HTMLInputElement;
    cy.mount({
      setup: () => () => {
        const current = text.value;
        return h(
          TypographyParagraph,
          {},
          {
            default: () => [
              h('span', { key: 'text' }, current),
              h('input', { id: 'slot-editor', key: 'editor' }),
            ],
          },
        );
      },
    });
    cy.get('#slot-editor')
      .type('draft')
      .then((element) => {
        input = element[0] as HTMLInputElement;
      });
    cy.then(() => {
      text.value = 'Second';
    });
    cy.get('.sd-typography > span').should('have.text', 'Second');
    cy.get('#slot-editor')
      .should('have.value', 'draft')
      .and('be.focused')
      .and((element) => expect(element[0]).to.equal(input));
  });
});
