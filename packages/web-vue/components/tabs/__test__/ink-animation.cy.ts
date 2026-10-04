import { h } from 'vue';

import Tabs, { TabPane } from '../index';

describe('Tabs ink animation', () => {
  for (const position of ['top', 'left'] as const) {
    it(`respects animation for the ${position} indicator`, () => {
      cy.mount(Tabs, {
        props: { position },
        slots: {
          default: () =>
            [1, 2].map((key) => h(TabPane, { key, title: `Tab ${key}` }, () => `Panel ${key}`)),
        },
      });
      cy.get('.sd-tabs-nav-ink').should('have.css', 'transition-duration', '0s');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ animation: true }));
      cy.get('.sd-tabs-nav-ink').should(($ink) => {
        const durations = getComputedStyle($ink[0]).transitionDuration.split(',');
        expect(durations.every((duration) => parseFloat(duration) > 0)).to.equal(true);
      });
    });
  }
});
