const mouseEvents = '[data-testid="mouse-events"]';
describe('React Markdown root attributes and event paths', () => {
  beforeEach(() =>
    cy.intercept('/markdown-event-image.svg', {
      headers: { 'content-type': 'image/svg+xml' },
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="red"/></svg>',
    }),
  );
  it('forwards host attributes and native React handlers while consuming renderer configuration', () => {
    cy.visit('/markdown-events.html');
    cy.get('#markdown-host').should(($root) => {
      expect($root).to.have.attr('aria-label', 'Markdown content');
      expect($root).to.have.attr('data-owner', 'owner-0');
      expect($root).to.have.attr('title', 'Title 0');
      expect($root).to.have.attr('tabindex', '0');
      for (const name of [
        'content',
        'nodes',
        'final',
        'batchrendering',
        'showtooltips',
        'streamingcomponents',
        'oncopycode',
        'onvirtualstatechange',
      ])
        expect($root).not.to.have.attr(name);
    });
    cy.get('#markdown-host').trigger('keydown', { key: 'ArrowDown' });
    cy.get(mouseEvents).should('contain.text', 'key:ArrowDown');
    cy.contains('button', 'Update').click();
    cy.get('#markdown-host').should('have.attr', 'title', 'Title 1');
    cy.get('#markdown-host').should('have.attr', 'data-owner', 'owner-1');
  });
  for (const kind of ['heading', 'paragraph', 'blockquote', 'admonition', 'html'])
    for (const fragment of [false, true]) {
      it(`forwards one native event for ${kind} with fragment=${fragment}`, () => {
        cy.visit(`/markdown-events.html?kind=${kind}${fragment ? '&fragment' : ''}`);
        cy.contains('a', 'Link')
          .trigger('mouseover', { eventConstructor: 'MouseEvent' })
          .trigger('mouseout', { eventConstructor: 'MouseEvent' })
          .trigger('click', { eventConstructor: 'MouseEvent' });
        cy.get(mouseEvents).should(
          'have.text',
          'over:0:true:true:-|out:0:true:true:-|click:0:true:true:-',
        );
        if (fragment) {
          cy.get('[data-testid="event-host"] .markdown-renderer').should('not.exist');
          cy.get('[data-testid="event-host"] .node-slot').should('not.exist');
        }
      });
    }
  for (const fragment of [false, true]) {
    it(`supports current handlers, cancellation and remounting with fragment=${fragment}`, () => {
      cy.visit(`/markdown-events.html?prevent${fragment ? '&fragment' : ''}`);
      cy.contains('button', 'Update').click();
      cy.contains('a', 'Link').trigger('click', { eventConstructor: 'MouseEvent' });
      cy.get(mouseEvents).should('have.text', 'click:1:true:true:-');
      cy.location('hash').should('equal', '');
      cy.contains('button', 'Clear').click();
      cy.get('[data-testid="outside"]').trigger('click', { eventConstructor: 'MouseEvent' });
      cy.get(mouseEvents).should('be.empty');
      cy.contains('button', 'Toggle renderer').click();
      cy.contains('button', 'Toggle renderer').click();
      cy.contains('a', 'Link').trigger('click', { eventConstructor: 'MouseEvent' });
      cy.get(mouseEvents).should('have.text', 'click:1:true:true:-');
    });
    it(`honors an explicit React capture cancellation with fragment=${fragment}`, () => {
      cy.visit(`/markdown-events.html?kind=custom&capture${fragment ? '&fragment' : ''}`);
      cy.get('[data-testid="custom-node"]').trigger('click', { eventConstructor: 'MouseEvent' });
      cy.get(mouseEvents).should('be.empty');
    });
    it(`does not forward image preview portal actions with fragment=${fragment}`, () => {
      cy.visit(`/markdown-events.html?kind=image${fragment ? '&fragment' : ''}`);
      cy.get('.sd-image-img').should(($image) =>
        expect(($image[0] as HTMLImageElement).naturalWidth).to.equal(80),
      );
      cy.get('.sd-image-img').trigger('click', { eventConstructor: 'MouseEvent' });
      cy.get(mouseEvents).should('have.text', 'click:0:true:true:-');
      cy.get('.sd-image-preview-close-btn').trigger('click', { eventConstructor: 'MouseEvent' });
      cy.get(mouseEvents).should('have.text', 'click:0:true:true:-');
    });
    it(`preserves manually dispatched native events with fragment=${fragment}`, () => {
      cy.visit(`/markdown-events.html${fragment ? '?fragment' : ''}`);
      cy.contains('a', 'Link').trigger('mouseover').trigger('mouseout');
      cy.get(mouseEvents).should('have.text', 'over:0:false:true:-|out:0:false:true:-');
    });
  }
  it('moves delegation between normal and fragment roots without retaining old listeners', () => {
    cy.visit('/markdown-events.html');
    for (let index = 0; index < 4; index++) {
      cy.contains('button', 'Toggle fragment').click();
      cy.contains('button', 'Clear').click();
      cy.contains('a', 'Link').trigger('click', { eventConstructor: 'MouseEvent' });
      cy.get(mouseEvents).should('have.text', 'click:0:true:true:-');
    }
  });
  it('renders all fragment nodes despite virtual and delayed batch settings', () => {
    cy.visit('/markdown-events.html?kind=large&fragment');
    cy.get('h2.sd-typography').should('have.length', 60);
    cy.get('.markdown-renderer, .node-slot, .node-spacer').should('not.exist');
  });
  it('renders completed uncoordinated content without waiting for delayed batches', () => {
    cy.visit('/markdown-events.html?kind=large&nonvirtual');
    cy.get('.node-slot h2.sd-typography').should('have.length', 60);
  });
});
