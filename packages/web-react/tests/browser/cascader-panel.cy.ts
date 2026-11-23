describe('React standalone Cascader Panel', () => {
  it('selects complete paths and publishes update before change', () => {
    cy.visit('/cascader-panel.html?path');
    cy.contains('button', /^Root$/).click();
    cy.contains('button', /^One$/).click();
    cy.get('[data-testid="events"]').should(
      'have.text',
      'update:["root","one"]|change:["root","one"]',
    );
  });
  it('navigates and selects through the real panel keyboard handler', () => {
    cy.visit('/cascader-panel.html');
    cy.get('[data-testid="panel"]').focus().type('{downarrow}{rightarrow}{downarrow}{enter}');
    cy.get('[data-testid="events"]').should('have.text', 'update:"two"|change:"two"');
  });
  it('reflects controlled strict selection only after parent acceptance', () => {
    cy.visit('/cascader-panel.html?controlled&strict');
    cy.contains('button', /^Root$/)
      .find('label')
      .click();
    cy.contains('button', /^Root$/)
      .find('input')
      .should('not.be.checked');
    cy.contains('button', /^Accept$/).click();
    cy.contains('button', /^Root$/)
      .find('label')
      .click();
    cy.contains('button', /^Root$/)
      .find('input')
      .should('be.checked');
    cy.contains('button', /^Release$/).click();
    cy.contains('button', /^Root$/)
      .find('input')
      .should('not.be.checked');
  });
  it('toggles parent multi selection and resets empty paths', () => {
    cy.visit('/cascader-panel.html?multiple');
    cy.contains('button', /^Root$/)
      .find('label')
      .click();
    cy.get('[data-testid="events"]').should('contain.text', 'update:["one","two"]');
    cy.contains('button', /^One$/).find('input').should('be.checked');
    cy.contains('button', /^Root$/)
      .find('label')
      .click();
    cy.get('[data-testid="events"]').should('contain.text', 'change:[]');
    cy.get('.sd-cascader-panel-column').should('have.length', 1);
  });
  it('switches to hover expansion and retains exiting columns until transition completes', () => {
    cy.visit('/cascader-panel.html');
    cy.contains('button', /^Hover$/).click();
    cy.contains('button', /^Root$/).trigger('mouseover');
    cy.get('.sd-cascader-panel-column').should('have.length', 2);
    cy.contains('button', /^One$/).should('be.visible');
    cy.contains('button', /^Last$/).trigger('mouseover');
    cy.get('.cascader-slide-leave-active').should('exist');
    cy.get('.sd-cascader-panel-column').should('have.length', 1);
  });
  it('renders lazy loading and selects loaded children in StrictMode', () => {
    cy.visit('/cascader-panel.html?lazy');
    cy.clock();
    cy.contains('button', /^Lazy$/).click();
    cy.get('.sd-icon-loading').should('exist');
    cy.tick(100);
    cy.clock().invoke('restore');
    cy.contains('button', /^Loaded$/).click();
    cy.get('[data-testid="events"]').should('have.text', 'update:"loaded"|change:"loaded"');
    cy.get('.sd-icon-loading').should('not.exist');
    cy.contains('button', 'Unmount').click();
    cy.get('[data-testid="panel"]').should('not.exist');
  });

  for (const key of ['{rightarrow}', '{enter}']) {
    it(`loads a standalone lazy branch using ${key} and selects its child`, () => {
      cy.visit('/cascader-panel.html?lazy');
      cy.clock();
      const panel = () => cy.get('[data-testid="panel"]');
      panel().focus().type(`{downarrow}${key}`);
      cy.get('.sd-icon-loading').should('exist');
      cy.get('[data-testid="events"]').should('be.empty');
      cy.tick(100);
      cy.clock().invoke('restore');
      cy.contains('button', /^Loaded$/).should('be.visible');
      panel().type('{rightarrow}{enter}');
      cy.get('[data-testid="events"]').should('have.text', 'update:"loaded"|change:"loaded"');
    });
  }

  for (const failure of ['throw', 'reject']) {
    it(`recovers a standalone lazy branch after ${failure}`, () => {
      cy.visit(`/cascader-panel.html?lazy&failure=${failure}`);
      cy.contains('button', /^Lazy$/).click();
      cy.get('.sd-icon-loading').should('not.exist');
      cy.contains('button', /^Loaded$/).should('not.exist');
      cy.get('[data-testid="events"]').should('be.empty');
      cy.contains('button', /^Lazy$/).click();
      cy.contains('button', /^Loaded$/).click();
      cy.get('[data-testid="events"]').should('have.text', 'update:"loaded"|change:"loaded"');
    });
  }
});
