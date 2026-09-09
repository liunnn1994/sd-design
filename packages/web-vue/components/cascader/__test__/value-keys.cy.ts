import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  describe(`${component.name} literal value keys`, () => {
    it('allows a parent value containing an opening bracket', () => {
      cy.mount(component, {
        props: {
          multiple: true,
          options: [
            { value: 'a[', label: 'Parent', children: [{ value: 'child', label: 'Child' }] },
          ],
        },
      });
      if (component === Cascader) cy.get('.sd-select-view').click();
      cy.contains('button', 'Parent').find('.sd-checkbox').click();
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.deep.equal([[['child']]]);
      });
    });

    it('does not treat a dot in a parent value as a wildcard', () => {
      cy.mount(component, {
        props: {
          multiple: true,
          modelValue: ['selected'],
          options: [
            {
              value: 'a.b',
              label: 'Literal parent',
              children: [{ value: 'other', label: 'Other' }],
            },
            {
              value: 'axb',
              label: 'Selected parent',
              children: [{ value: 'selected', label: 'Selected' }],
            },
          ],
        },
      });
      if (component === Cascader) cy.get('.sd-select-view').click();
      cy.contains('button', 'Literal parent')
        .find('.sd-checkbox')
        .should('not.have.class', 'sd-checkbox-checked');
      cy.contains('button', 'Selected parent')
        .find('.sd-checkbox')
        .should('have.class', 'sd-checkbox-checked');
    });
  });
}
