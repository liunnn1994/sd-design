import { reactive } from 'vue';

import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  describe(`${component.name} disabled keyboard state`, () => {
    it('skips disabled children when entering the next column', () => {
      cy.mount(component, {
        props: {
          options: [
            {
              value: 'root',
              label: 'Root',
              children: [
                { value: 'disabled', label: 'Disabled child', disabled: true },
                { value: 'enabled', label: 'Enabled child' },
              ],
            },
          ],
        },
      });
      if (component === Cascader) cy.get('.sd-select-view').click();
      const target = component === Cascader ? 'input' : '.sd-cascader-panel';
      cy.get(target)
        .trigger('keydown', { key: 'ArrowDown' })
        .trigger('keydown', { key: 'ArrowRight' });
      cy.contains('button', 'Enabled child').should('have.class', 'sd-cascader-option-active');
      cy.get(target).trigger('keydown', { key: 'Enter' });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.deep.equal([['enabled']]);
      });
    });

    it('does not select an active option after it becomes disabled', () => {
      const options = reactive([{ value: 'one', label: 'One', disabled: false }]);
      cy.mount(component, { props: { options } });
      if (component === Cascader) cy.get('.sd-select-view').click();
      const target = component === Cascader ? 'input' : '.sd-cascader-panel';
      cy.get(target).trigger('keydown', { key: 'ArrowDown' });
      cy.contains('button', 'One').should('have.class', 'sd-cascader-option-active');
      cy.then(() => {
        options[0].disabled = true;
      });
      cy.contains('button', 'One').should('be.disabled');
      cy.get(target).trigger('keydown', { key: 'Enter' });
      cy.get('@vue').then(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.equal(undefined);
      });
    });
  });
}
