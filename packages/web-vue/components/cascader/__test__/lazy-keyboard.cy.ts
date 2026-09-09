import type { CascaderOption } from '../interface';

import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  for (const key of ['ArrowRight', 'Enter']) {
    it(`${component.name} loads a lazy branch with ${key}`, () => {
      let done: (children?: CascaderOption[]) => void;
      const loader = cy.spy((_option: CascaderOption, finish: typeof done) => {
        done = finish;
      });
      cy.mount(component, {
        props: { options: [{ value: 'root', label: 'Root', isLeaf: false }], loadMore: loader },
      });
      if (component === Cascader) cy.get('.sd-select-view').click();
      const target = component === Cascader ? 'input' : '.sd-cascader-panel';
      cy.get(target).trigger('keydown', { key: 'ArrowDown' }).trigger('keydown', { key });
      cy.then(() => expect(loader).to.have.been.calledOnce);
      cy.then(() => done([{ value: 'child', label: 'Child', isLeaf: true }]));
      cy.contains('button', 'Child').should('be.visible');
      cy.get(target).trigger('keydown', { key: 'ArrowRight' }).trigger('keydown', { key: 'Enter' });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.deep.equal([['child']]);
      });
    });
  }
}
