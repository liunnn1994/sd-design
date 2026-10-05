import { h, ref } from 'vue';

import Trigger from '../index';

describe('Trigger resize robustness', () => {
  for (const prop of ['autoFitPopupWidth', 'autoFitPopupMinWidth']) {
    it(`updates ${prop} when the trigger width changes`, () => {
      const width = ref(120);
      cy.mount({
        setup: () => () =>
          h(
            Trigger,
            { [prop]: true, defaultPopupVisible: true, position: 'bl', autoFitPosition: false },
            {
              default: () => h('button', { style: { width: `${width.value}px` } }, 'Open'),
              content: () => h('div', 'Popup'),
            },
          ),
      });
      const css = prop === 'autoFitPopupWidth' ? 'width' : 'min-width';
      cy.get('.sd-trigger-popup').should('have.css', css, '120px');
      cy.then(() => {
        width.value = 200;
      });
      cy.get('button').should('have.css', 'width', '200px');
      cy.get('.sd-trigger-popup').should('have.css', css, '200px');
    });
  }
});
