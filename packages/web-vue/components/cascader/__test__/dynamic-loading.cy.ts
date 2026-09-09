import type { CascaderOption } from '../interface';

import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  describe(`${component.name} dynamic loader`, () => {
    it('recognizes lazy branches after enabling loadMore', () => {
      cy.mount(component, { props: { options: [{ value: 'root', label: 'Root' }] } });
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({
          loadMore: (_option: CascaderOption, done: (children?: CascaderOption[]) => void) =>
            done([{ value: 'child', label: 'Loaded child', isLeaf: true }]),
        }),
      );
      if (component === Cascader) cy.get('.sd-select-view').click();
      cy.contains('button', 'Root').click();
      cy.contains('button', 'Loaded child').should('be.visible');
    });
  });
}
