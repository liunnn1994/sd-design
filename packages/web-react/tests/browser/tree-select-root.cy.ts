describe('React TreeSelect dropdown root', () => {
  it('opens the tree, selects a leaf and closes the popup', () => {
    cy.visit('/tree-select-root.html');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-select-popup [data-key="one"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '"one"');
    cy.get('.sd-tree-select-popup').should('not.exist');
    cy.contains('button', 'Focus').click();
    cy.get('[role="combobox"]').should('be.focused');
  });
  it('searches mapped keys and renders an empty result', () => {
    cy.visit('/tree-select-root.html');
    cy.get('[role="combobox"]').type('one');
    cy.get('.sd-tree-select-popup [data-key="one"]').should('be.visible');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('not.exist');
    cy.get('[role="combobox"]').clear().type('absent');
    cy.get('.sd-tree-select-popup').should('contain.text', 'No teams');
  });

  it('keeps numeric key zero in filtered results and emits the numeric selection', () => {
    cy.visit('/tree-select-root.html');
    cy.get('[role="combobox"]').type('0');
    cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-title').should('be.visible').click();
    cy.get('output').should('have.text', '0');
    cy.get('.sd-tree-select-popup').should('not.exist');
  });

  it('updates an open search result when its filter changes without changing the query', () => {
    cy.visit('/tree-select-root.html?live-filter');
    const popup = () => cy.get('.sd-tree-select-popup');
    popup().find('[data-key="one"]').should('be.visible');
    popup().find('[data-key="two"]').should('not.exist');
    cy.contains('button', 'Replace filter').click();
    cy.get('[role="combobox"]').should('have.value', 'match');
    popup().find('[data-key="one"]').should('not.exist');
    popup().find('[data-key="two"] .sd-tree-node-title').should('be.visible').click();
    cy.get('output').should('have.text', '"two"');
  });

  for (const guard of ['readonly', 'disabled']) {
    it(`blocks selection when an open popup becomes ${guard} and accepts selection after unlocking`, () => {
      cy.visit(`/tree-select-root.html?guard=${guard}`);
      const root = () => cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-title');
      root().should('be.visible');
      cy.contains('button', 'Toggle selection guard').click();
      root().click({ force: true });
      cy.get('output').should('be.empty');
      cy.contains('button', 'Toggle selection guard').click();
      root().click();
      cy.get('output').should('have.text', '0');
    });
  }

  it('honors defaultShow while explicit defaultPopupVisible takes precedence', () => {
    cy.visit('/tree-select-root.html?default-show');
    cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-tree-select-popup [data-key="0"]').should('be.visible');
    cy.visit('/tree-select-root.html?default-show&force-closed');
    cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-tree-select-popup').should('not.exist');
  });
  it('checks through node titles and keeps a multiple popup open', () => {
    cy.visit('/tree-select-root.html?check');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-select-popup [data-key="one"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '["one"]');
    cy.get('.sd-tree-select-popup').should('be.visible');
    cy.get('.sd-tree-select-popup [data-key="one"] input').should('be.checked');
  });

  it('temporarily expands matches and restores the manual expansion after clearing search', () => {
    cy.visit('/tree-select-root.html');
    const input = () => cy.get('[role="combobox"]');
    const root = () => cy.get('.sd-tree-select-popup [data-key="0"]');
    input().click();
    root().should('have.attr', 'aria-expanded', 'false');
    input().type('one');
    cy.get('.sd-tree-select-popup [data-key="one"]').should('be.visible');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('not.exist');
    input().clear();
    root().should('have.attr', 'aria-expanded', 'false');
    root().find('.sd-tree-node-switcher-icon').click();
    input().type('one');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('not.exist');
    input().clear();
    root().should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('be.visible');
    input().type('no-match');
    cy.get('.sd-tree-select-popup').should('contain.text', 'No teams');
    cy.get('.sd-tree-select-popup [role="tree"]').should('not.be.visible');
    input().clear();
    root().should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('be.visible');
  });

  it('retains externally controlled expansion when clearing temporary search results', () => {
    cy.visit('/tree-select-root.html?controlled-expansion');
    const input = () => cy.get('[role="combobox"]');
    const root = () => cy.get('.sd-tree-select-popup [data-key="0"]');
    input().click();
    root().should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('be.visible');
    input().type('one');
    cy.get('.sd-tree-select-popup [data-key="one"]').should('be.visible');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('not.exist');
    input().clear();
    root().should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('be.visible');
  });

  for (const virtual of [false, true]) {
    it(`stays at the bottom after collapsing a branch, virtual=${virtual}`, () => {
      cy.visit(`/tree-select-root.html?tall${virtual ? '&virtual' : ''}`);
      const viewport = () =>
        cy.get(
          virtual
            ? '.sd-tree-select-popup .sd-virtual-list-scroller'
            : '.sd-tree-select-tree-wrapper [data-overlayscrollbars-viewport]',
        );
      cy.get('[role="combobox"]').click();
      viewport().scrollTo('bottom');
      cy.get('.sd-tree-select-popup [data-key="two"]').should('be.visible');
      viewport().then(([$previous]) => {
        const oldHeight = $previous.scrollHeight;
        expect($previous.scrollTop).to.be.greaterThan(0);
        cy.get('[data-key="root-30"] .sd-tree-node-switcher-icon').click({ scrollBehavior: false });
        cy.get('[data-key="root-30"]').should('have.attr', 'aria-expanded', 'false');
        viewport().should(([$current]) => {
          expect($current.scrollHeight).to.be.lessThan(oldHeight);
          expect($current.scrollTop).to.be.greaterThan(0);
          expect($current.scrollTop).to.equal($current.scrollHeight - $current.clientHeight);
        });
      });
    });
  }

  for (const { mode, keys } of [
    { mode: 'default', keys: [0, 'one', 'two'] },
    { mode: 'child', keys: ['one', 'two'] },
    { mode: 'parent', keys: [0] },
    { mode: 'strict', keys: [0] },
  ]) {
    it(`publishes ${mode} checked keys from a real parent checkbox`, () => {
      cy.visit(`/tree-select-root.html?check&${mode}`);
      cy.get('[role="combobox"]').click();
      cy.get('[data-key="0"] .sd-tree-node-switcher-icon').click();
      cy.get('[data-key="0"] .sd-checkbox').click();
      cy.get('output').should(($value) => expect(JSON.parse($value.text())).to.have.members(keys));
      cy.get('[data-key="one"] input').should(mode === 'strict' ? 'not.be.checked' : 'be.checked');
      cy.get('.sd-tree-select-popup').should('be.visible');
    });
  }

  it('keeps a nonselectable lazy branch tag locked while loading and selects its new leaf', () => {
    cy.visit('/tree-select-root.html?lazy');
    cy.contains('.sd-select-view-tag', 'Branch').find('.sd-tag-close-btn').should('not.exist');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-trigger-popup:has(.sd-tree-select-popup)').should(
      'have.css',
      'pointer-events',
      'auto',
    );
    cy.clock();
    cy.get('[data-key="branch"] .sd-tree-node-switcher-icon').click();
    cy.get('[data-testid="load-calls"]').should('have.text', '1');
    cy.get('[data-key="branch"] .sd-icon-loading').should('exist');
    cy.get('[data-key="loaded"]').should('not.exist');
    cy.tick(120);
    cy.clock().invoke('restore');
    cy.get('[data-key="loaded"] .sd-tree-node-title').should('be.visible').click();
    cy.get('output').should('have.text', '["branch","loaded"]');
    cy.get('[data-key="branch"] .sd-icon-loading').should('not.exist');
    cy.contains('.sd-select-view-tag', 'Loaded leaf').find('.sd-tag-close-btn').should('exist');
  });
});
