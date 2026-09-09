import BloomMenu from '../index';

const items = [
  { value: 'first', label: 'First' },
  { value: 'second', label: 'Second', disabled: true },
];

describe('BloomMenu lifecycle', () => {
  it('opens and selects with native Enter activation', () => {
    const onSelect = cy.spy();
    cy.mount(BloomMenu, { props: { items, onSelect } });
    cy.get('body').click('topLeft');
    cy.get('[data-bloom-menu-trigger]').focus().should('have.focus');
    const enter = () => {
      cy.then(() =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Input.dispatchKeyEvent',
          params: {
            type: 'keyDown',
            key: 'Enter',
            code: 'Enter',
            windowsVirtualKeyCode: 13,
            text: '\r',
          },
        }),
      );
      cy.then(() =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Input.dispatchKeyEvent',
          params: { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
        }),
      );
    };
    enter();
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
    enter();
    cy.wrap(onSelect).should('have.been.calledWith', items[0], 0);
    cy.get('[data-bloom-menu-trigger]').should('have.focus');
    cy.get('[data-bloom-menu-panel]').should('not.be.visible');
  });

  beforeEach(() => {
    cy.document().then((doc) => {
      doc.body.style.padding = '160px';
    });
  });

  it('keeps a controlled closed panel hidden when the parent rejects opening', () => {
    const onUpdate = cy.spy();
    cy.mount(BloomMenu, { props: { items, 'modelValue': false, 'onUpdate:modelValue': onUpdate } });
    cy.get('[data-bloom-menu-trigger]').click();
    cy.wrap(onUpdate).should('have.been.calledWith', true);
    cy.get('[data-bloom-menu-panel]:visible').should('not.exist');
    cy.get('[data-bloom-menu-trigger]').should('have.attr', 'aria-expanded', 'false');
  });

  it('does not let pending initial focus steal focus after controlled closing', () => {
    cy.mount(BloomMenu, { props: { items, modelValue: true } });
    cy.get('@vue').then(async ({ wrapper }) => {
      await wrapper.setProps({ modelValue: false });
      const trigger = wrapper.element.querySelector('[data-bloom-menu-trigger]') as HTMLElement;
      trigger.focus();
    });
    // Observe the delayed focus retry during the closing morph.
    cy.wait(250);
    cy.get('[data-bloom-menu-trigger]').should('have.focus');
  });

  it('cancels a scheduled hide when controlled state reopens during closing', () => {
    cy.mount(BloomMenu, { props: { items, modelValue: true } });
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: false }));
    cy.get('.sd-bloom-menu').should('not.have.class', 'sd-bloom-menu-open');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: true }));
    cy.wait(500);
    cy.get('[data-bloom-menu-panel]').should('be.visible');
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
  });

  it('uses current indices and disabled state after items are reordered', () => {
    const onSelect = cy.spy();
    cy.mount(BloomMenu, { props: { items, defaultOpen: true, onSelect } });
    cy.get('.sd-bloom-menu-item').first().should('have.focus');
    const updated = [
      { ...items[1], disabled: false },
      { ...items[0], disabled: true },
    ];
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ items: updated }));
    cy.contains('.sd-bloom-menu-item', 'First').should('be.disabled').click({ force: true });
    cy.wrap(onSelect).should('not.have.been.called');
    cy.contains('.sd-bloom-menu-item', 'Second').click();
    cy.wrap(onSelect).should('have.been.calledWith', updated[0], 0);
    cy.get('[data-bloom-menu-trigger]').should('have.focus');
  });

  it('updates empty state and normalizes finite fractional and zero column counts', () => {
    cy.mount(BloomMenu, { props: { items, defaultOpen: true, columns: 2.9 } });
    cy.get('[data-bloom-menu-panel]').should('have.css', '--bloom-menu-columns', '2');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ items: [], columns: 0 }));
    cy.get('.sd-bloom-menu-item').should('not.exist');
    cy.get('.sd-bloom-menu-empty').should('be.visible');
    cy.get('[data-bloom-menu-panel]').should('have.css', '--bloom-menu-columns', '1');
  });
});
