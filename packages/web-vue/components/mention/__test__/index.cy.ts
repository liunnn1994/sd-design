import Mention from '../index';

const data = ['Bytedance', 'Bytedesign', 'Bytenumner'];

describe('Mention', () => {
  it('renders the dropdown on @', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@');
    cy.get('.sd-select-option').should('exist');
  });

  it('selects a value via keyboard', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@');
    cy.get('input').type('{downarrow}');
    cy.get('.sd-select-option-active').should('contain.text', 'Bytedesign');
    cy.get('input').type('{uparrow}');
    cy.get('.sd-select-option-active').should('contain.text', 'Bytedance');
    cy.get('input').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]).to.deep.equal(['@Bytedance']);
    });
  });
});
