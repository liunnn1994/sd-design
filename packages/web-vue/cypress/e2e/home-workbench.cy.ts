Cypress.on('uncaught:exception', (error) => {
  if (error.message.includes('ResizeObserver loop')) return false;
});

describe('首页中央输入面板', () => {
  beforeEach(() => {
    cy.viewport(1280, 1000);
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined });
        cy.spy(win.console, 'warn').as('consoleWarn');
        cy.spy(win.console, 'error').as('consoleError');
      },
    });
    cy.get('.home-hero__workbench astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-workbench [data-state]').should('have.attr', 'data-state', 'complete');
    cy.get('starlight-theme-select select:visible').select('light');
  });

  it('刷新后水合一致，Tabs 和 Collapse 的可访问性关联保留', () => {
    cy.get('#components').scrollIntoView();
    cy.get('#components astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-previews [role="tab"]').each(($tab) => {
      const id = $tab.attr('aria-controls');
      cy.document().then((doc) => expect(doc.getElementById(id!)).to.exist);
    });
    for (const alias of ['@consoleWarn', '@consoleError']) {
      cy.get(alias).should((spy) => {
        const calls = (spy as unknown as { getCalls(): { args: unknown[] }[] }).getCalls();
        const warnings = calls
          .map((call) => call.args.map(String).join(' '))
          .filter((text) => /hydration/i.test(text));
        expect(warnings.join('\n')).to.equal('');
      });
    }
  });
});
