import Copy from '../index';

describe('Copy browser clipboard integration', () => {
  afterEach(() => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.resetPermissions',
        params: {},
      }),
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setFocusEmulationEnabled',
        params: { enabled: false },
      }),
    );
  });

  it('writes the clicked content to the browser clipboard', () => {
    const content = `SD_COPY_${Date.now()}`;
    cy.window().then((win) =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.grantPermissions',
        params: {
          origin: win.location.origin,
          permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
        },
      }),
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setFocusEmulationEnabled',
        params: { enabled: true },
      }),
    );
    cy.mount(Copy, { props: { content, component: 'button' }, slots: { default: 'Copy text' } });
    cy.contains('button', 'Copy text').click();
    cy.window()
      .then((win) => win.navigator.clipboard.readText())
      .should('equal', content);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.deep.equal([[content]]);
    });
  });
});
