import Transfer from '../index';

const data = [0, 1, 2, 3].map((index) => ({
  disabled: false,
  value: `option${index + 1}`,
  label: `Option ${index + 1}`,
}));

describe('Transfer', () => {
  it('emits change on select + move', () => {
    cy.mount(Transfer, { props: { data } });
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().click({ force: true });
    cy.get('.sd-transfer-operations button').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['option1']]);
    });
  });

  it('emits select on check-all', () => {
    cy.mount(Transfer, { props: { data } });
    cy.get('.sd-transfer-view-header .sd-checkbox-target').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]).to.deep.equal([
        ['option1', 'option2', 'option3', 'option4'],
      ]);
    });
  });
});
