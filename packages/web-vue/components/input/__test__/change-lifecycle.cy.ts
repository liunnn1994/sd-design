import Input from '../index';

describe('Input change lifecycle', () => {
  it('does not report a change when edits restore the original value', () => {
    cy.mount(Input, { props: { defaultValue: 'original' } });
    cy.get('input').clear().type('original').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
    cy.get('input').type(' changed{enter}').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
      expect(wrapper.emitted('change')![0][0]).to.equal('original changed');
    });
  });

  it('does not repeat the clear change when the input blurs', () => {
    cy.mount(Input, { props: { defaultValue: 'original', allowClear: true } });
    cy.get('input').focus();
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
      expect(wrapper.emitted('change')![0][0]).to.equal('');
    });
  });
});
