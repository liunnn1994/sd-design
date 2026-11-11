describe('React FilePreviewer media view', () => {
  it('loads real native audio and composes user load/error callbacks after source replacement', () => {
    cy.visit('/file-preview-media.html');
    cy.get('audio').should('have.attr', 'controls');
    cy.get('output').should('have.text', 'loaded:1:0');
    cy.contains('button', 'Invalid source').click();
    cy.get('output').should('have.text', 'error:1:1');
  });
  it('loads actual Video.js audio and video custom elements with forwarded skin/player attributes', () => {
    for (const type of ['audio', 'video']) {
      cy.visit(`/file-preview-media.html?skin&${type}`);
      cy.get(
        `${type}-player[data-player="yes"] ${type}-neutral-skin[data-skin="yes"] ${type}`,
      ).should('have.class', `sd-file-previewer-${type}`);
      cy.window().should((win) => {
        expect(win.customElements.get(`${type}-player`)).to.be.a('function');
        expect(win.customElements.get(`${type}-neutral-skin`)).to.be.a('function');
      });
      cy.get('output').should('have.text', 'loaded:1:0');
    }
  });
  it('exposes custom media state and restores the native media element', () => {
    cy.visit('/file-preview-media.html?custom');
    cy.get('[data-testid="custom"]')
      .should('have.text', 'native:false:loading')
      .click()
      .should('have.text', 'native:false:error');
    cy.get('audio').should('not.exist');
    cy.contains('button', 'Toggle custom').click();
    cy.get('output').should('have.text', 'loaded:1:0');
  });
});
