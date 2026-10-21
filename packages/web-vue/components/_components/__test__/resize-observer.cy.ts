import { defineComponent, h, ref } from 'vue';

import ResizeObserver from '../resize-observer-v2';

describe('ResizeObserver delivery', () => {
  let removeListener = () => {};
  afterEach(() => removeListener());
  it('allows a resize listener to change an observed ancestor without a native delivery loop', () => {
    const errors: string[] = [];
    cy.window().then((win) => {
      const onError = (event: ErrorEvent) => {
        if (event.message.includes('ResizeObserver loop')) errors.push(event.message);
      };
      win.addEventListener('error', onError);
      removeListener = () => win.removeEventListener('error', onError);
    });
    cy.mount(
      defineComponent({
        setup() {
          const width = ref(100);
          return () =>
            h('div', { style: { width: `${width.value}px` } }, [
              h(
                ResizeObserver,
                {
                  onResize: () => {
                    width.value = 200;
                  },
                },
                {
                  default: () =>
                    h('div', {
                      'data-testid': 'resized-child',
                      'style': { width: '100%', height: '10px' },
                    }),
                },
              ),
            ]);
        },
      }),
    );
    cy.get('[data-testid="resized-child"]').should(($child) => {
      expect($child[0].getBoundingClientRect().width).to.equal(200);
    });
    cy.window().then(
      (win) =>
        new Cypress.Promise<void>((resolve) => {
          win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
        }),
    );
    cy.then(() => expect(errors).to.deep.equal([]));
  });
});
