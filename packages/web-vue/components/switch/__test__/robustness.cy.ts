import { defineComponent, h, ref } from 'vue';

import Switch from '../index';

describe('Switch robustness', () => {
  it('starts auto loading after modelValue is dynamically added', () => {
    const controlled = ref(false);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Switch, { autoLoading: true, ...(controlled.value ? { modelValue: false } : {}) }),
      }),
    );
    cy.get('button').click();
    cy.get('button').should('not.have.class', 'sd-switch-loading');
    cy.then(() => {
      controlled.value = true;
    });
    cy.get('button').should('have.attr', 'aria-checked', 'false').click();
    cy.get('button').should('have.class', 'sd-switch-loading');
  });

  it('uses automatic loading after an explicit loading prop is removed', () => {
    const externalLoading = ref(true);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Switch, {
            autoLoading: true,
            modelValue: false,
            ...(externalLoading.value ? { loading: false } : {}),
          }),
      }),
    );
    cy.get('button').click();
    cy.get('button').should('not.have.class', 'sd-switch-loading');
    cy.then(() => {
      externalLoading.value = false;
    });
    cy.get('button').click();
    cy.get('button').should('have.class', 'sd-switch-loading');
  });

  it('recognizes kebab-case model-value for automatic loading', () => {
    cy.mount(() => h(Switch, { 'model-value': false, 'autoLoading': true }));
    cy.get('button').click();
    cy.get('button').should('have.class', 'sd-switch-loading');
  });

  for (const action of ['disabled', 'unmount'] as const) {
    it(`does not apply a pending beforeChange after ${action}`, () => {
      let resolve: (value: boolean) => void;
      const change = cy.spy().as('change');
      cy.mount(Switch, {
        props: {
          beforeChange: () =>
            new Promise<boolean>((done) => {
              resolve = done;
            }),
          onChange: change,
        },
      });
      cy.get('button').click();
      cy.get('button').should('have.class', 'sd-switch-loading');
      cy.get('@vue').then(({ wrapper }) =>
        action === 'unmount' ? wrapper.unmount() : wrapper.setProps({ disabled: true }),
      );
      cy.then(async () => {
        resolve(true);
        await Promise.resolve();
        await Promise.resolve();
      });
      cy.get('@change').should('not.have.been.called');
    });
  }
});
