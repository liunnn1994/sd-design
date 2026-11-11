import { h } from 'vue';

import Select from '../index';

describe('Select popup animation', () => {
  it('visibly animates opening and closing, including reopening', () => {
    cy.mount(
      { setup: () => () => h(Select, { options: ['Alpha', 'Beta'] }) },
      { global: { stubs: { transition: false } } },
    );
    for (const opening of [true, false, true, false]) {
      cy.get('.sd-select-view').then(($trigger) => {
        const doc = $trigger[0].ownerDocument;
        const win = doc.defaultView!;
        return new Cypress.Promise<void>((resolve) => {
          let intermediate = false;
          const start = win.performance.now();
          if (opening) $trigger[0].click();
          else {
            doc.body.dispatchEvent(new win.PointerEvent('pointerdown', { bubbles: true }));
            doc.body.dispatchEvent(new win.MouseEvent('mousedown', { bubbles: true }));
            doc.body.click();
          }
          const sample = () => {
            const wrapper = doc
              .querySelector('.sd-select-dropdown')
              ?.closest<HTMLElement>('.sd-trigger-popup-wrapper');
            if (wrapper) {
              const opacity = Number(win.getComputedStyle(wrapper).opacity);
              const visible = win.getComputedStyle(wrapper.parentElement!).visibility !== 'hidden';
              if (visible && opacity > 0 && opacity < 1) intermediate = true;
            }
            if (win.performance.now() - start < 500) win.requestAnimationFrame(sample);
            else {
              expect(
                intermediate,
                opening ? 'visible enter frames' : 'visible leave frames',
              ).to.equal(true);
              resolve();
            }
          };
          win.requestAnimationFrame(sample);
        });
      });
      if (opening) cy.get('.sd-select-dropdown').should('be.visible');
      else cy.get('.sd-select-dropdown').should('not.be.visible');
    }
  });
});
