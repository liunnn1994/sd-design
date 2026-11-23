import { defineComponent, h, ref } from 'vue';

import Select from '../index';

describe('Select search lifecycle', () => {
  it('loads asynchronous search results without filtering server matches by label', () => {
    let finishSearch: () => void;
    const change = cy.spy().as('change');
    cy.mount(
      defineComponent({
        setup() {
          const loading = ref(false);
          const options = ref<{ value: number; label: string }[]>([]);
          return () =>
            h(Select, {
              options: options.value,
              loading: loading.value,
              filterOption: false,
              searchDelay: 60,
              spinProps: { tip: 'Loading matches' },
              onChange: change,
              onSearch: async (query: string) => {
                if (query !== 'remote') return;
                loading.value = true;
                await new Promise<void>((resolve) => {
                  finishSearch = resolve;
                });
                options.value = [{ value: 51, label: 'Server result' }];
                loading.value = false;
              },
            });
        },
      }),
    );
    cy.get('input[role="combobox"]').type('remote');
    cy.contains('.sd-select-dropdown', 'Loading matches').should('be.visible');
    cy.then(() => finishSearch());
    cy.contains('[role="option"]', 'Server result').should('be.visible');
    cy.get('input[role="combobox"]').type('{enter}');
    cy.get('.sd-select-view-value').should('contain.text', 'Server result');
    cy.get('@change').should('have.been.calledOnceWith', 51);
    cy.get('input[role="combobox"]').should('have.attr', 'aria-expanded', 'false');
  });

  it('cancels pending search when unmounted', () => {
    cy.clock();
    const search = cy.spy().as('search');
    let searchTimer: number;
    cy.window().then((win) => {
      cy.spy(win, 'setTimeout').as('setTimer');
      cy.spy(win, 'clearTimeout').as('clearTimer');
    });
    cy.mount(Select, { props: { allowSearch: true, searchDelay: 1000, onSearch: search } });
    cy.get('input').type('query', { delay: 0 });
    cy.get('@setTimer').then((timer: ReturnType<typeof cy.spy>) => {
      const calls = timer
        .getCalls()
        .filter((call: ReturnType<ReturnType<typeof cy.spy>['getCall']>) => call.args[1] === 1000);
      expect(calls.length).to.be.greaterThan(0);
      searchTimer = calls[calls.length - 1].returnValue;
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('@clearTimer').should((clearTimer) => {
      expect(clearTimer).to.have.been.calledWith(searchTimer);
    });
    cy.tick(1000);
    cy.get('@search').should('not.have.been.called');
  });
});
