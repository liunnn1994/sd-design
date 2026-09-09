import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  describe(`${component.name} parent keyboard selection`, () => {
    it('expands a parent without selecting it in non-strict single mode', () => {
      cy.mount(component, {
        props: {
          options: [
            { value: 'root', label: 'Root', children: [{ value: 'child', label: 'Child' }] },
          ],
        },
      });
      if (component === Cascader) {
        cy.get('.sd-select-view').click();
        cy.get('input')
          .trigger('keydown', { key: 'ArrowDown' })
          .trigger('keydown', { key: 'Enter' });
      } else {
        cy.get('.sd-cascader-panel')
          .trigger('keydown', { key: 'ArrowDown' })
          .trigger('keydown', { key: 'Enter' });
      }
      cy.contains('button', 'Child').should('be.visible');
      cy.get('@vue').then(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.equal(undefined);
      });
    });
  });
}
