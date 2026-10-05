import Cascader from '../index';

const options = [{ value: 'root', label: 'Root', children: [{ value: 'leaf', label: 'Leaf' }] }];

describe('Cascader reactive popup props', () => {
  for (const prop of ['show', 'popupVisible'] as const) {
    it(`honors ${prop} when it is first supplied after mounting`, () => {
      cy.mount(Cascader, { props: { options } });
      cy.get('.sd-cascader-dropdown-panel').should('not.exist');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [prop]: true }));
      cy.get('.sd-cascader-dropdown-panel').should('be.visible');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [prop]: false }));
      cy.get('.sd-cascader-dropdown-panel').should('not.be.visible');
    });
  }

  it('updates the path separator in an open search result', () => {
    cy.mount(Cascader, {
      props: { options, allowSearch: true, inputValue: 'Leaf', defaultPopupVisible: true },
    });
    cy.get('.sd-cascader-search-option').should('contain.text', 'Root / Leaf');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ separator: ' > ' }));
    cy.get('.sd-cascader-search-option').should('contain.text', 'Root > Leaf');
  });
});
