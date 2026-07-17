import { defineComponent, h, ref } from 'vue';

import Switch from '../index';

describe('Switch', () => {
  it('emits change on click', () => {
    cy.mount(Switch);
    cy.get('button').click();
    cy.get('@vue').should(({ wrapper }) => {
      const changeEvent = wrapper.emitted('change') as Array<[boolean]> | undefined;
      expect(changeEvent?.[0]?.[0]).to.equal(true);
    });
  });

  it('exposes role=switch and toggles aria-checked on click', () => {
    cy.mount(Switch);
    cy.get('button').should('have.attr', 'role', 'switch');
    cy.get('button').should('have.attr', 'aria-checked', 'false');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'true');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'false');
  });

  it('auto enters loading until the controlled modelValue updates', () => {
    cy.clock();
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const value = ref<boolean | string | number>(false);
          const onUpdate = (nextValue: boolean | string | number) => {
            handleUpdate(nextValue);
            setTimeout(() => {
              value.value = nextValue;
            }, 1000);
          };
          return () =>
            h(Switch, {
              'modelValue': value.value,
              'autoLoading': true,
              'onUpdate:modelValue': onUpdate,
            });
        },
      }),
    );
    cy.get('button').click();
    cy.get('@handleUpdate').should('have.been.calledOnce');
    cy.get('button')
      .should('have.class', 'sd-switch-loading')
      .and('have.attr', 'aria-checked', 'false');
    cy.get('button').click();
    cy.get('@handleUpdate').should('have.been.calledOnce');
    cy.tick(1000);
    cy.get('button')
      .should('not.have.class', 'sd-switch-loading')
      .and('have.attr', 'aria-checked', 'true');
  });
});
