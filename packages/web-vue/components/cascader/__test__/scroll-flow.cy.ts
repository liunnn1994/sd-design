import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  describe(`${component.name} real scroll flow`, () => {
    it('scrolls both columns and selects the last leaf with real transitions', () => {
      const options = Array.from({ length: 30 }, (_, parent) => ({
        value: `parent-${parent}`,
        label: `Parent ${parent}`,
        children: Array.from({ length: 30 }, (_, child) => ({
          value: `child-${parent}-${child}`,
          label: `Child ${parent}-${child}`,
        })),
      }));
      cy.mount(component, {
        props: { options, pathMode: true },
        global: { stubs: { 'transition': false, 'transition-group': false } },
      });
      if (component === Cascader) cy.get('.sd-select-view').click();
      cy.get('.sd-cascader-panel-column').should('have.length', 1).and('be.visible');
      cy.contains('button', 'Parent 29').scrollIntoView().should('be.visible').click();
      cy.get('.sd-cascader-panel-column')
        .eq(0)
        .find('[data-overlayscrollbars-viewport]')
        .should(($viewport) => {
          expect($viewport[0].scrollTop).to.be.greaterThan(0);
        });
      cy.get('.sd-cascader-panel-column')
        .should('have.length', 2)
        .each(($column) => {
          expect($column[0].getBoundingClientRect().height).to.be.greaterThan(0);
          expect($column[0].getBoundingClientRect().width).to.be.greaterThan(0);
        });
      cy.contains('button', 'Child 29-29').scrollIntoView().should('be.visible');
      cy.get('.sd-cascader-panel-column')
        .eq(1)
        .find('[data-overlayscrollbars-viewport]')
        .should(($viewport) => {
          expect($viewport[0].scrollTop).to.be.greaterThan(0);
        });
      cy.contains('button', 'Child 29-29').click();
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.deep.equal([[['parent-29', 'child-29-29']]]);
      });
      if (component === Cascader) {
        cy.get('.sd-select-view').should('contain.text', 'Parent 29 / Child 29-29');
      }
    });
  });
}
