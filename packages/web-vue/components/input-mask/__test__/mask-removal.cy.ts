import InputMask from '../index';

describe('InputMask dynamic mask removal', () => {
  it('removes placeholders when switching to unrestricted input', () => {
    cy.mount(InputMask, { props: { mask: '99-99', defaultValue: '12' } });
    cy.get('input').should('have.value', '12-__');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mask: undefined }));
    cy.get('input').should('have.value', '12-');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mask: '99-99' }));
    cy.get('input').should('have.value', '12-__').type('34').should('have.value', '12-34');
  });
});
