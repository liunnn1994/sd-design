import InputNumber from '../index';

describe('InputNumber dynamic state', () => {
  it('preserves the value when switching modes and continues stepping', () => {
    cy.mount(InputNumber, { props: { defaultValue: 4 } });
    cy.get('input').type('{upArrow}').should('have.value', '5');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mode: 'button' }));
    cy.get('.sd-input-number-mode-button').should('exist');
    cy.get('input').should('have.value', '5');
    cy.get('[aria-label="减少"]').trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '4');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mode: 'embed' }));
    cy.get('.sd-input-number-mode-embed').should('exist');
    cy.get('input').type('{upArrow}').should('have.value', '5');
  });

  for (const mode of ['embed', 'button'] as const) {
    it(`blocks keyboard stepping while readonly and resumes in ${mode} mode`, () => {
      cy.mount(InputNumber, { props: { mode, defaultValue: 4 } });
      cy.get('input').type('{upArrow}').should('have.value', '5');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ readonly: true }));
      cy.get('input').should('have.attr', 'readonly');
      cy.get('input').trigger('keydown', { key: 'ArrowUp' }).should('have.value', '5');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ readonly: false }));
      cy.get('input').should('not.have.attr', 'readonly');
      cy.get('input').type('{downArrow}').should('have.value', '4');
    });
  }
});
