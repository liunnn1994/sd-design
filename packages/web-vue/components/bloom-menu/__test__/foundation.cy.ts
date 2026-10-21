import BloomMenu from '../index';

describe('BloomMenu shared controller with reduced motion', () => {
  afterEach(() => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    );
  });
  it('focuses the first enabled item, selects and reopens under a real reduced-motion preference', () => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    const items = [
      { value: 'disabled', label: 'Disabled', disabled: true },
      { value: 'enabled', label: 'Enabled' },
    ];
    cy.mount(BloomMenu, { props: { items, defaultOpen: true } });
    cy.window().should((win) =>
      expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).to.equal(true),
    );
    cy.contains('.sd-bloom-menu-item', 'Enabled').should('have.focus').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]?.[0]).to.equal(wrapper.props('items')[1]);
      expect(wrapper.emitted('select')?.[0]?.[1]).to.equal(1);
    });
    cy.get('[data-bloom-menu-trigger]').should('have.focus');
    cy.get('[data-bloom-menu-panel]').should('not.be.visible');
    cy.get('[data-bloom-menu-trigger]').click();
    cy.contains('.sd-bloom-menu-item', 'Enabled').should('have.focus');
  });
});
