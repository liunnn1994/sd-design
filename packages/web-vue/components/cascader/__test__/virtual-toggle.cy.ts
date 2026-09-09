import Cascader from '../index';

describe('Cascader dynamic virtualization', () => {
  it('enables and disables virtualization while the popup is open', () => {
    cy.mount(Cascader, {
      props: {
        options: Array.from({ length: 100 }, (_, value) => ({ value, label: `Option ${value}` })),
      },
    });
    cy.get('.sd-select-view').click();
    cy.get('.sd-virtual-list').should('not.exist');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ virtualListProps: { height: 200, itemSize: 36 } }),
    );
    cy.get('.sd-virtual-list').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ virtualListProps: undefined }));
    cy.get('.sd-virtual-list').should('not.exist');
    cy.contains('button', 'Option 99').scrollIntoView().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.deep.equal([[99]]);
    });
  });
});
