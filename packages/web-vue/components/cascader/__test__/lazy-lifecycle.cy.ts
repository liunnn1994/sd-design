import type { CascaderOption } from '../interface';

import Cascader, { CascaderPanel } from '../index';

for (const component of [Cascader, CascaderPanel]) {
  describe(`${component.name} lazy loading lifecycle`, () => {
    const open = () => {
      if (component === Cascader) cy.get('.sd-select-view').click();
    };

    for (const failure of ['throw', 'reject']) {
      it(`allows retry after a ${failure} failure`, () => {
        let calls = 0;
        cy.mount(component, {
          props: {
            options: [{ value: 'root', label: 'Root', isLeaf: false }],
            loadMore: (_option: CascaderOption, done: (children?: CascaderOption[]) => void) => {
              calls++;
              if (calls === 1) {
                if (failure === 'throw') throw new Error('Load failed');
                return Promise.reject(new Error('Load failed'));
              }
              done([{ value: 'child', label: 'Recovered child', isLeaf: true }]);
            },
          },
        });
        open();
        cy.contains('button', 'Root').click();
        cy.then(() => Cypress.Promise.delay(0));
        cy.contains('button', 'Root').click();
        cy.contains('button', 'Recovered child').should('be.visible');
        cy.then(() => expect(calls).to.equal(2));
      });
    }

    it('shares one pending load across repeated expansion clicks', () => {
      let finish: (children?: CascaderOption[]) => void;
      const loadMore = cy.spy((_option: CascaderOption, done: typeof finish) => {
        finish = done;
      });
      cy.mount(component, {
        props: { options: [{ value: 'root', label: 'Root', isLeaf: false }], loadMore },
      });
      open();
      cy.contains('button', 'Root').click().click();
      cy.then(() => expect(loadMore).to.have.been.calledOnce);
      cy.then(() => finish([{ value: 'child', label: 'Child', isLeaf: true }]));
      cy.contains('button', 'Child').should('be.visible');
    });

    it('ignores a pending result after replacing the source option', () => {
      let finish: (children?: CascaderOption[]) => void;
      cy.mount(component, {
        props: {
          options: [{ value: 'root', label: 'Root', isLeaf: false }],
          loadMore: (_option: CascaderOption, done: typeof finish) => {
            finish = done;
          },
        },
      });
      open();
      cy.contains('button', 'Root').click();
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ options: [{ value: 'root', label: 'Replacement', isLeaf: false }] }),
      );
      cy.contains('button', 'Replacement').should('exist');
      cy.then(() => {
        finish([{ value: 'stale', label: 'Stale child', isLeaf: true }]);
        return Cypress.Promise.delay(0);
      });
      cy.contains('button', 'Stale child').should('not.exist');
    });
  });
}
