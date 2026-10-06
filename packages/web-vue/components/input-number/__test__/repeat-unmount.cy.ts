import InputNumber from '../index';

describe('InputNumber repeat timer cleanup', () => {
  it('does not dispatch a held step event after unmount', () => {
    cy.clock();
    cy.mount(InputNumber, { props: { defaultValue: 0 } });
    const repeated = cy.spy().as('repeated');
    cy.get('.sd-input-number-step-button').first().trigger('mousedown', { button: 0 });
    cy.get('input').should('have.value', '1');
    cy.get('.sd-input-number-step-button')
      .first()
      .then(($button) => {
        $button[0].addEventListener('mousedown', repeated);
      });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.tick(1200);
    cy.get('@repeated').should('not.have.been.called');
  });
});
