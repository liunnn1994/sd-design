import InputTag from '../index';

describe('InputTag removal boundaries', () => {
  it('respects tagProps.closable when removing with Backspace', () => {
    cy.mount(InputTag, {
      props: {
        defaultValue: [
          'removable',
          { value: 'locked', label: 'Locked', closable: true, tagProps: { closable: false } },
        ],
      },
    });
    cy.get('input').type('{backspace}');
    cy.get('.sd-input-tag-tag').should('have.length', 1).and('contain.text', 'Locked');
    cy.get('input').type('{backspace}');
    cy.get('.sd-input-tag-tag').should('have.length', 1).and('contain.text', 'Locked');
  });

  for (const state of ['disabled', 'readonly'] as const) {
    it(`prevents tagProps from allowing removal while ${state}`, () => {
      cy.mount(InputTag, {
        props: {
          [state]: true,
          defaultValue: [{ value: 'keep', label: 'Keep', tagProps: { closable: true } }],
        },
      });
      cy.get('.sd-tag-close-btn').should('not.exist');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [state]: false }));
      cy.get('.sd-tag-close-btn').click();
      cy.get('.sd-input-tag-tag').should('not.exist');
    });
  }
});
