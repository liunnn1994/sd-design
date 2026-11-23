describe('React Markdown HTML adapter', () => {
  beforeEach(() => {
    cy.intercept('/markdown-html.svg', {
      headers: { 'content-type': 'image/svg+xml' },
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="red"/></svg>',
    });
  });
  it('adapts trusted HTML to real SD components with native attributes and committed styles', () => {
    cy.visit('/markdown-html.html');
    cy.get('#html-heading')
      .should('have.class', 'sd-typography')
      .and('have.class', 'own-heading')
      .and('have.text', 'Heading & title')
      .and('have.css', 'font-size', '32px')
      .and('have.css', 'color', 'rgb(12, 34, 56)')
      .then(($heading) => {
        expect($heading[0].style.getPropertyPriority('color')).to.equal('important');
        expect($heading[0].style.fontFamily).to.include('a;b');
        expect($heading[0].style.getPropertyValue('--Token')).to.equal("'x;y'");
      });
    cy.get('#html-paragraph')
      .should('have.class', 'sd-typography')
      .and('contain.text', 'A & B local link end');
    cy.contains('span', 'Malformed CSS')
      .should('have.css', 'padding-left', '7px')
      .and('have.css', 'color', 'rgb(0, 0, 255)');
    cy.get('#html-link').should('have.class', 'sd-link');
    cy.get('#html-button')
      .should('have.class', 'sd-btn-secondary')
      .and('not.be.disabled')
      .and('have.css', 'padding-left', '9px')
      .click();
    cy.get('#html-button').should('have.attr', 'type', 'reset');
    cy.get('[data-testid="html-events"]').should('have.text', 'click:true');
    cy.get('.html-image.sd-image')
      .should('have.css', 'border-radius', '5px')
      .find('img')
      .should(($image) => expect(($image[0] as HTMLImageElement).naturalWidth).to.equal(80));
    cy.get('.html-image .sd-image-img').click();
    cy.get('[data-testid="html-events"]').should('have.text', 'click:true|click:true');
    cy.get('.sd-image-preview-close-btn').click();
    cy.get('[data-testid="html-events"]').should('have.text', 'click:true|click:true');
    cy.contains('button', 'Change HTML').click();
    cy.get('#html-button').should('have.css', 'padding-left', '17px');
  });
  it('keeps native inputs editable and updates them when the HTML source changes', () => {
    cy.visit('/markdown-html.html');
    cy.get('label[for="html-input"]').click();
    cy.get('#html-input')
      .should('be.focused')
      .and('have.value', 'First')
      .clear()
      .type('Edited')
      .should('have.value', 'Edited');
    cy.get('#html-check').should('be.checked').uncheck().should('not.be.checked');
    cy.contains('button', 'Restyle HTML').click();
    cy.get('#html-input').should('have.value', 'Edited');
    cy.get('#html-check').should('not.be.checked');
    cy.get('#html-heading')
      .should('have.css', 'color', 'rgb(60, 50, 40)')
      .then(($heading) => expect($heading[0].style.getPropertyPriority('color')).to.equal(''));
    cy.contains('button', 'Change HTML').click();
    cy.get('#html-input').should('have.value', 'Next');
  });
  it('respects safe policy, strips active content and renders escape policy as text', () => {
    cy.visit('/markdown-html.html?safe');
    cy.get('#html-heading').should('have.class', 'sd-typography').and('not.have.attr', 'style');
    cy.get('#html-button').should('not.exist');
    cy.visit('/markdown-html.html?unsafe');
    cy.get('[data-testid="html-fixture"] script').should('not.exist');
    cy.get('[data-testid="html-fixture"] a').should(($link) => {
      expect($link).not.to.have.attr('onclick');
      expect($link).not.to.have.attr('href');
    });
    cy.get('body').should('not.have.attr', 'data-injected');
    cy.visit('/markdown-html.html?escape');
    cy.get('[data-testid="html-fixture"] h2').should('not.exist');
    cy.get('[data-testid="html-fixture"]').should('contain.text', '<h2');
  });
  it('preserves upstream custom HTML components and leaves streaming HTML with the upstream node', () => {
    cy.visit('/markdown-html.html?custom');
    cy.get('[data-testid="custom-html"]')
      .should('contain.text', 'Custom body')
      .and('have.attr', 'aria-label', 'Notes');
    cy.visit('/markdown-html.html?loading');
    cy.get('.html-block-node').should('exist');
    cy.get('#html-heading').should('not.have.class', 'sd-typography');
  });
  it('selects a block host for block content even when supplied as html_inline', () => {
    cy.visit('/markdown-html.html?inline');
    cy.get('[data-testid="html-fixture"] > div').should('exist');
    cy.get('#html-heading').should('have.class', 'sd-typography');
  });

  it('preserves whitespace between rendered links and keeps decoded markup as text', () => {
    cy.visit('/markdown-html.html?whitespace');
    cy.get('#html-spacing').should('have.text', 'one\n\ttwo');
    cy.get('#html-spacing a').should('have.length', 2);
    cy.get('#html-entity').should('have.attr', 'aria-label', 'A & B');
    cy.get('#html-entity').should('have.text', '<em>literal</em>').find('em').should('not.exist');
  });

  it('updates the existing inline block host when content and inherited policy change', () => {
    cy.visit('/markdown-html.html?inline&policy-update');
    cy.get('[data-testid="html-fixture"] > div').as('block', { type: 'static' });
    cy.get('@block').should('have.text', 'Original');
    cy.contains('button', 'Toggle HTML policy').click();
    cy.contains('button', 'Change HTML').click();
    cy.get('@block')
      .find('.sd-btn')
      .should('have.text', 'Updated')
      .and('have.attr', 'type', 'reset');
    cy.contains('button', 'Toggle HTML policy').click();
    cy.get('@block').find('.sd-btn').should('not.exist');
    cy.get('[data-testid="html-fixture"] > div').then(([$block]) => {
      cy.get('@block').should(([$original]) => expect($block).to.equal($original));
    });
  });
});
