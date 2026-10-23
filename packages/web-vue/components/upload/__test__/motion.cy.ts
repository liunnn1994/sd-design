import Upload from '../index';

describe('Upload reduced motion', () => {
  afterEach(() => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    );
  });

  it('disables list entry animation when reduced motion is requested', () => {
    cy.mount(Upload, {
      props: { defaultFileList: [{ uid: 'file', name: 'file.txt' }] },
    });
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] },
      }),
    );
    cy.get('.sd-upload-list-item').should('have.css', 'animation-name', 'sd-upload-arrive');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    cy.window().should((win) => {
      expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).to.equal(true);
    });
    cy.get('.sd-upload-list-item').should('have.css', 'animation-name', 'none');
  });
});
