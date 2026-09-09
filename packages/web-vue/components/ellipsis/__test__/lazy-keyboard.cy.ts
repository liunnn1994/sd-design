import { defineComponent, h } from 'vue';

import { PerformantEllipsis } from '../index';

const pressKey = (key: string, code: string, keyCode: number) =>
  cy.then(async () => {
    for (const type of ['keyDown', 'keyUp']) {
      await Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: { type, key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode },
      });
    }
  });

describe('PerformantEllipsis keyboard access', () => {
  it('is reachable with Tab before activation and retains focus for Enter expansion', () => {
    cy.mount(
      defineComponent({
        setup: () => () => [
          h('button', { class: 'before' }, 'Before'),
          h(
            PerformantEllipsis,
            { tooltip: false, expandTrigger: 'click', style: 'width: 150px' },
            () => 'Long text '.repeat(30),
          ),
          h('button', { class: 'after' }, 'After'),
        ],
      }),
    );
    cy.get('.before').focus();
    pressKey('Tab', 'Tab', 9);
    cy.get('.sd-ellipsis[data-part="root"]').should('be.focused');
    pressKey('Enter', 'Enter', 13);
    cy.get('.sd-ellipsis').should('have.attr', 'aria-expanded', 'true');
    pressKey('Enter', 'Enter', 13);
    cy.get('.sd-ellipsis').should('have.attr', 'aria-expanded', 'false');
    pressKey('Tab', 'Tab', 9);
    cy.get('.after').should('be.focused');
  });
});
