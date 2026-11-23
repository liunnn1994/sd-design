describe('React Markdown SD node adapters', () => {
  beforeEach(() => {
    cy.intercept('/markdown-*.svg', {
      headers: { 'content-type': 'image/svg+xml' },
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="red"/></svg>',
    });
  });
  it('renders six real Typography heading levels and preserves blockquote citations', () => {
    cy.visit('/markdown-nodes.html');
    [36, 32, 28, 24, 20, 16].forEach((size, index) => {
      cy.get(`#heading-${index + 1}`)
        .should('have.class', 'sd-typography')
        .and('have.class', 'own-heading')
        .and('have.css', 'font-size', `${size}px`);
    });
    cy.get('blockquote.sd-typography')
      .should('have.attr', 'cite', 'https://example.com/source')
      .and('contain.text', 'Quoted text');
  });
  it('uses safe Link attributes, hardened new tabs and real tooltip content', () => {
    cy.visit('/markdown-nodes.html');
    cy.get('[data-testid="link"] a').should(($link) => {
      expect($link).to.have.class('sd-link').and.have.class('node-link');
      expect($link).to.have.attr('href', 'https://example.com/path');
      expect($link).to.have.attr('target', '_blank');
      expect($link).to.have.attr('data-owner', 'node');
      expect($link).to.have.attr('rel', 'author noopener noreferrer');
      expect($link).not.to.have.attr('onclick');
      expect($link).to.have.css('color', 'rgb(100, 50, 20)');
    });
    cy.get('[data-testid="link"] a').trigger('mouseover');
    cy.get('.sd-tooltip-content').should('contain.text', 'Link title');
  });
  it('does not retain unsafe destinations and keeps local anchors in the current tab', () => {
    cy.visit('/markdown-nodes.html?unsafe');
    cy.get('[data-testid="link"] a').should(($link) => {
      expect($link).not.to.have.attr('href');
      expect($link).not.to.have.attr('target');
    });
    cy.visit('/markdown-nodes.html?anchor');
    cy.get('[data-testid="link"] a').should(($link) => {
      expect($link).to.have.attr('href', '#heading-1');
      expect($link).not.to.have.attr('target');
    });
  });
  it('forwards native mouse events once and preserves the disabled-tooltip title', () => {
    cy.visit('/markdown-nodes.html?anchor&no-tooltip');
    cy.get('[data-testid="link"] a')
      .should('have.attr', 'title', 'Link title')
      .trigger('mouseover', { eventConstructor: 'MouseEvent' })
      .trigger('mouseout', { eventConstructor: 'MouseEvent' })
      .trigger('click', { eventConstructor: 'MouseEvent' });
    cy.get('[data-testid="events"]').should(
      'have.text',
      'over:mouseover:true|out:mouseout:true|click:click:true',
    );
    cy.get('.sd-tooltip-content').should('not.exist');
  });
  it('uses the shared loading-link animation and replaces it when the link settles', () => {
    cy.visit('/markdown-nodes.html?loading');
    cy.get('[data-testid="link"] a').should('not.exist');
    cy.get('.sd-markdown-render-link-loading')
      .should('have.attr', 'aria-busy', 'true')
      .and('contain.text', 'Streaming link');
    cy.get('.sd-markdown-render-link-loading-indicator')
      .should('have.css', 'animation-name', 'sd-markdown-link-pulse')
      .and('have.css', 'height', '2px');
    cy.contains('button', 'Loading').click();
    cy.get('[data-testid="link"] a').should('have.text', 'Complete link');
  });
  it('uses Typography inline code, disabled task checkboxes and Alert/details admonitions', () => {
    cy.visit('/markdown-nodes.html');
    cy.get('.sd-typography code').first().should('have.text', 'const a = 1');
    cy.get('[data-testid="code-slot"]').should('have.text', 'Custom code');
    cy.get('.sd-checkbox[aria-label="checked"] input').should('be.checked').and('be.disabled');
    cy.get('.sd-checkbox[aria-label="unchecked"] input')
      .should('not.be.checked')
      .and('be.disabled');
    cy.get('.sd-alert-warning')
      .should('contain.text', 'Warning title')
      .and('contain.text', 'Warning body');
    cy.get('details').should('not.have.attr', 'open');
    cy.get('details > summary').click();
    cy.get('details').should('have.attr', 'open');
    cy.get('details .sd-alert-success').should('contain.text', 'Collapsible body');
  });
  it('loads real Image content, reports committed height and opens its preview', () => {
    cy.visit('/markdown-nodes.html?image-lazy');
    cy.get('.sd-markdown-render-image img').should(($image) => {
      expect($image).to.have.attr('alt', 'Markdown picture');
      expect($image).to.have.attr('loading', 'lazy');
      expect(($image[0] as HTMLImageElement).naturalWidth).to.equal(80);
    });
    cy.get('.sd-markdown-render-image-caption').should('have.text', 'Image caption');
    cy.get('[data-testid="image-placeholder"]').should('not.exist');
    cy.get('[data-testid="image-events"]')
      .should('contain.text', 'load:/markdown-original.svg')
      .and('contain.text', 'height:image:')
      .and('contain.text', 'settled:image');
    cy.get('.sd-markdown-render-image img').as('loadedImage', { type: 'static' });
    cy.contains('button', /^Loading$/).click();
    cy.get('[data-testid="image-placeholder"]').should('not.exist');
    cy.get('.sd-markdown-render-image img').then(([$image]) => {
      cy.get('@loadedImage').should(([$original]) => expect($image).to.equal($original));
    });
    cy.get('[data-testid="image-events"]').should(($events) => {
      expect(
        $events
          .text()
          .split('|')
          .filter((event) => event.startsWith('load:')),
      ).to.deep.equal(['load:/markdown-original.svg']);
    });
    cy.get('.sd-markdown-render-image .sd-image-img').click();
    cy.get('.sd-image-preview-wrapper').should('be.visible');
    cy.get('[data-testid="image-events"]').should(
      'contain.text',
      'click:click:/markdown-original.svg',
    );
  });
  it('tries a safe fallback once and resets the image state for a new source', () => {
    cy.intercept('/markdown-original.svg', { statusCode: 404 });
    cy.visit('/markdown-nodes.html?image-fallback');
    cy.get('.sd-markdown-render-image img').should('have.attr', 'src', '/markdown-fallback.svg');
    cy.get('[data-testid="image-events"]')
      .should('contain.text', 'load:/markdown-fallback.svg')
      .and('not.contain.text', 'error:');
    cy.contains('button', 'Next image').click();
    cy.get('[data-testid="image-events"]').should('contain.text', 'load:/markdown-next.svg');
    cy.get('.sd-markdown-render-image img').should('have.attr', 'src', '/markdown-next.svg');
  });
  it('renders the error slot after terminal failure and rejects unsafe image sources', () => {
    cy.intercept('/markdown-original.svg', { statusCode: 404 });
    cy.intercept('/markdown-fallback.svg', { statusCode: 404 });
    cy.visit('/markdown-nodes.html?image-fallback');
    cy.get('[data-testid="image-error"]').should('have.text', '/markdown-fallback.svg');
    cy.get('[data-testid="image-events"]').should('contain.text', 'error:/markdown-fallback.svg');
    cy.get('[data-testid="image-placeholder"]').should('not.exist');
    cy.visit('/markdown-nodes.html?image-unsafe');
    cy.get('.sd-markdown-render-image img').should('not.exist');
    cy.get('[data-testid="image-error"]').should('have.text', 'No source');
  });
  it('keeps the placeholder while the Markdown image token is still loading', () => {
    cy.visit('/markdown-nodes.html?image-loading');
    cy.get('.sd-markdown-render-image img').should('not.exist');
    cy.get('[data-testid="image-placeholder"]').should('have.text', '/markdown-original.svg');
    cy.get('[data-testid="image-events"]')
      .should('contain.text', 'pending:image')
      .and('not.contain.text', 'load:');
    cy.contains('button', 'Finish image token').click();
    cy.get('.sd-markdown-render-image img').should(($img) => {
      expect(($img[0] as HTMLImageElement).naturalWidth).to.equal(80);
    });
    cy.get('[data-testid="image-placeholder"]').should('not.exist');
    cy.get('[data-testid="image-events"]').should(($events) => {
      const events = $events.text().split('|');
      expect(events.filter((event) => event.startsWith('load:'))).to.deep.equal([
        'load:/markdown-original.svg',
      ]);
      expect(events.filter((event) => event === 'pending:image')).to.have.length(
        events.filter((event) => event === 'settled:image').length,
      );
      expect(events.at(-1)).to.equal('settled:image');
    });
  });

  it('keeps the replacement image pending when the prior load callback changes its key', () => {
    cy.visit('/markdown-nodes.html?replace-on-load');
    const events = () => cy.get('[data-testid="image-events"]');
    events().should(($events) => {
      const records = $events.text().split('|');
      expect(records.slice(records.indexOf('load:/markdown-original.svg'))).to.deep.equal([
        'load:/markdown-original.svg',
        'settled:image',
        'pending:replacement',
      ]);
    });
    cy.get('.sd-markdown-render-image img').should('not.exist');
    cy.get('[data-testid="image-placeholder"]').should('be.visible');
    cy.contains('button', 'Remove image node').click();
    cy.get('.sd-markdown-render-image').should('not.exist');
    events().should(($events) => {
      const records = $events.text().split('|');
      expect(records.filter((event) => event.endsWith(':replacement'))).to.deep.equal([
        'pending:replacement',
        'settled:replacement',
      ]);
    });
  });
});
