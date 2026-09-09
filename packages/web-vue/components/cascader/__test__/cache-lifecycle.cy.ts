import type { CascaderOption } from '../interface';

import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  describe(`${component.name} loaded cache`, () => {
    it('reloads children after replacing an option with the same value', () => {
      let calls = 0;
      cy.mount(component, {
        props: {
          options: [{ value: 'root', label: 'Root', isLeaf: false }],
          loadMore: (_option: CascaderOption, done: (children?: CascaderOption[]) => void) => {
            calls++;
            done([{ value: `child-${calls}`, label: `Child ${calls}`, isLeaf: true }]);
          },
        },
      });
      if (component === Cascader) cy.get('.sd-select-view').click();
      cy.contains('button', 'Root').click();
      cy.contains('button', 'Child 1').should('be.visible');
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ options: [{ value: 'root', label: 'Replacement', isLeaf: false }] }),
      );
      cy.contains('button', 'Replacement').click();
      cy.contains('button', 'Child 2').should('be.visible');
      cy.contains('button', 'Child 1').should('not.exist');
    });
  });
}
