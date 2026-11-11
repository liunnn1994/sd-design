export {};
const visit = (query = '', noObserver = false) =>
  cy.visit(`/markdown-viewport.html${query}`, {
    onBeforeLoad(window) {
      // Hold idle work so actual IntersectionObserver activation can be isolated.
      let next = 0;
      const callbacks = new Map<number, IdleRequestCallback>();
      window.requestIdleCallback = (callback) => {
        callbacks.set(++next, callback);
        return next;
      };
      window.cancelIdleCallback = (id) => {
        callbacks.delete(id);
      };
      Object.assign(window, {
        drainMarkdownIdle: () => {
          const entry = callbacks.entries().next().value;
          if (entry) {
            callbacks.delete(entry[0]);
            entry[1]({ didTimeout: true, timeRemaining: () => 0 });
          }
        },
        markdownIdleCount: () => callbacks.size,
      });
      if (noObserver) Object.defineProperty(window, 'IntersectionObserver', { value: undefined });
    },
  });
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
describe('React Markdown viewport and batch placeholders', () => {
  it('keeps all slots, activates actual visible nodes and excludes placeholders from measured counts', () => {
    visit();
    cy.get('.node-slot').should('have.length', 60);
    cy.get('[data-row="0"]').should('exist');
    cy.get('[data-row="59"]').should('not.exist');
    cy.get('.node-placeholder').should('have.length.greaterThan', 50);
    control('Measure');
    cy.get('output')
      .invoke('text')
      .should('not.be.empty')
      .then((text) => {
        const metrics = JSON.parse(text);
        expect(metrics.measuredCount).to.be.within(1, 5);
        expect(metrics.estimatedCount).to.equal(60 - metrics.measuredCount);
        expect(metrics.stable).to.equal(false);
      });
    cy.get('[data-testid="viewport"]').scrollTo('bottom');
    cy.get('[data-row="59"]').should('exist');
    control('Toggle deferral');
    cy.get('.node-slot > .node-content').should('have.length', 60);
    cy.get('.node-placeholder').should('not.exist');
  });
  it('drains idle slots and cancels pending work on unmount and session replacement', () => {
    visit();
    cy.get('.node-slot').should('have.length', 60);
    cy.window().should((window) =>
      expect(
        (window as unknown as { markdownIdleCount(): number }).markdownIdleCount(),
      ).to.be.greaterThan(0),
    );
    cy.get('[data-row="10"]').should('not.exist');
    cy.window().then((window) => {
      for (let index = 0; index < 10; index++)
        (window as unknown as { drainMarkdownIdle(): void }).drainMarkdownIdle();
    });
    cy.get('[data-row="10"]').should('exist');
    control('Change session');
    cy.get('[data-row="10"]').should('exist');
    control('Toggle renderer');
    cy.window().then((window) =>
      expect((window as unknown as { markdownIdleCount(): number }).markdownIdleCount()).to.equal(
        0,
      ),
    );
    control('Toggle renderer');
    cy.get('.node-slot').should('have.length', 60);
    cy.get('[data-row="10"]').should('not.exist');
    control('Settle');
    cy.get('.node-placeholder').should('exist');
    cy.get('output')
      .invoke('text')
      .should('not.be.empty')
      .then((text) => {
        expect(JSON.parse(text).stable).to.equal(false);
        expect(JSON.parse(text).measuredCount).to.be.lessThan(60);
      });
    control('Toggle deferral');
    cy.get('.node-slot > .node-content').should('have.length', 60);
    control('Measure');
    cy.get('output')
      .invoke('text')
      .should('not.be.empty')
      .then((text) => expect(JSON.parse(text).measuredCount).to.equal(60));
  });
  for (const query of ['?disabled', '?no-priority', '?cap', '?large', '?invalid-margin']) {
    it(`renders all content without deferred placeholders for ${query}`, () => {
      visit(query);
      cy.get('.node-slot > .node-content').should('have.length', query === '?large' ? 901 : 60);
      cy.get('.node-placeholder').should('not.exist');
    });
  }
  it('renders every fragment child without slot hosts or observers', () => {
    visit('?fragment');
    cy.get('[data-row]').should('have.length', 60);
    cy.get('.node-slot, .node-placeholder').should('not.exist');
  });
  it('renders immediately when IntersectionObserver is unavailable', () => {
    visit('', true);
    cy.get('.node-slot > .node-content').should('have.length', 60);
  });
  it('drains offscreen slots using real timers when idle callbacks are unavailable', () => {
    cy.visit('/markdown-viewport.html', {
      onBeforeLoad(window) {
        Object.defineProperty(window, 'requestIdleCallback', { value: undefined });
        Object.defineProperty(window, 'cancelIdleCallback', { value: undefined });
      },
    });
    cy.get('.node-slot > .node-content').should('have.length', 60);
    cy.get('.node-placeholder').should('not.exist');
  });
  it('retains slot geometry while content is revealed in batches', () => {
    visit('?batch');
    cy.get('.node-slot').should('have.length', 60);
    cy.get('.node-slot > .node-content').should('have.length', 1);
    cy.get('.node-placeholder').should('have.length', 59);
    control('Measure');
    cy.get('output')
      .invoke('text')
      .should('not.be.empty')
      .then((text) => {
        const metrics = JSON.parse(text);
        expect(metrics.renderedCount).to.equal(1);
        expect(metrics.measuredCount).to.equal(1);
        expect(metrics.stable).to.equal(false);
      });
    cy.window()
      .should((window) =>
        expect((window as unknown as { markdownIdleCount(): number }).markdownIdleCount()).to.equal(
          1,
        ),
      )
      .then((window) => (window as unknown as { drainMarkdownIdle(): void }).drainMarkdownIdle());
    cy.get('.node-slot > .node-content').should('have.length', 2);
    control('Append nodes');
    cy.get('.node-slot').should('have.length', 70);
    cy.get('.node-slot > .node-content').should('have.length', 2);
    control('Resize viewport');
    cy.get('[data-testid="viewport"]')
      .should('have.css', 'width', '240px')
      .invoke('prop', 'clientWidth')
      .then((width) => {
        cy.get('[data-testid="observed-width"]').should('have.text', String(width));
        control('Measure');
        cy.get('output')
          .invoke('text')
          .should('not.be.empty')
          .then((text) => {
            const value = JSON.parse(text);
            expect(value.width).to.equal(width);
            expect(value.renderedCount).to.equal(1);
            expect(value.measuredCount).to.equal(2);
          });
      });
    control('Change session');
    cy.get('.node-slot > .node-content').should('have.length', 2);
    control('Measure');
    cy.get('output')
      .invoke('text')
      .should('not.be.empty')
      .then((text) => {
        const value = JSON.parse(text);
        expect(value.renderedCount).to.equal(1);
        expect(value.measuredCount).to.equal(2);
      });
    control('Change thread');
    cy.get('.node-slot > .node-content').should('have.length', 1);
    control('Change thread');
    cy.get('.node-slot > .node-content').should('have.length', 1);
    control('Change batch config');
    cy.get('.node-slot > .node-content').should('have.length', 2);
    control('Toggle renderer');
    cy.window().then((window) =>
      expect((window as unknown as { markdownIdleCount(): number }).markdownIdleCount()).to.equal(
        0,
      ),
    );
    control('Toggle renderer');
    cy.get('.node-slot > .node-content').should('have.length', 2);
    control('Settle');
    cy.get('.node-slot > .node-content').should('have.length', 70);
    cy.get('.node-placeholder').should('not.exist');
  });
  it('renders batches through actual animation frames and delay timers without idle callbacks', () => {
    cy.visit('/markdown-viewport.html?batch&fast', {
      onBeforeLoad(window) {
        Object.defineProperty(window, 'requestIdleCallback', { value: undefined });
        Object.defineProperty(window, 'cancelIdleCallback', { value: undefined });
      },
    });
    cy.get('.node-slot').should('have.length', 60);
    cy.get('.node-slot > .node-content').should('have.length', 60);
    cy.get('.node-placeholder').should('not.exist');
  });
});
