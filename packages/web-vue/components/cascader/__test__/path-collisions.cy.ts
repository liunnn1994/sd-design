import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  describe(`${component.name} distinct paths`, () => {
    for (const [first, second] of [
      [
        ['a-b', 'c'],
        ['a', 'b-c'],
      ],
      [
        ['a%2Db', 'c'],
        ['a-b', 'c'],
      ],
    ]) {
      it(`keeps ${first.join('/')} distinct from ${second.join('/')}`, () => {
        cy.mount(component, {
          props: {
            multiple: true,
            pathMode: true,
            modelValue: [first],
            options: [
              {
                value: first[0],
                label: 'First parent',
                children: [{ value: first[1], label: 'First child' }],
              },
              {
                value: second[0],
                label: 'Second parent',
                children: [{ value: second[1], label: 'Second child' }],
              },
            ],
          },
        });
        if (component === Cascader) cy.get('.sd-select-view').click();
        cy.contains('button', 'Second parent').click();
        cy.contains('button', 'Second child')
          .find('.sd-checkbox')
          .should('not.have.class', 'sd-checkbox-checked')
          .click();
        cy.get('@vue').should(({ wrapper }) => {
          expect(wrapper.emitted('change')).to.deep.equal([[[first, second]]]);
        });
        cy.contains('button', 'First parent').click();
        cy.contains('button', 'First child')
          .find('.sd-checkbox')
          .should('have.class', 'sd-checkbox-checked');
      });
    }
  });
}
