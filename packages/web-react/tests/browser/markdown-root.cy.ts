const readMetrics = () =>
  cy
    .get('[data-testid="root-metrics"]')
    .invoke('text')
    .should('not.be.empty')
    .then((text) => JSON.parse(text));
const control = (text: string) => cy.contains('button', new RegExp(`^${text}$`)).click();

describe('React Markdown private root renderer', () => {
  it('parses Markdown into the local SD defaults without nested renderer instances', () => {
    cy.visit('/markdown-root.html?content');
    cy.get('.markdown-renderer h2.sd-typography').should('have.text', 'Heading');
    cy.get('.markdown-renderer .sd-link').should('have.text', 'link');
    cy.get('.markdown-renderer .sd-checkbox input').should('have.length', 2);
    cy.get('.markdown-renderer p .sd-checkbox-icon').should('have.prop', 'tagName', 'SPAN');
    cy.get('.markdown-renderer p .sd-checkbox div').should('not.exist');
    cy.get('.markdown-renderer blockquote.sd-typography').should('contain.text', 'Quote');
    cy.get('.markdown-renderer .markdown-renderer').should('not.exist');
    control('Settle');
    readMetrics().then((metrics) => {
      expect(metrics.stable).to.equal(true);
      expect(metrics.measuredCount).to.equal(metrics.nodeCount);
    });
  });
  it('measures real nodes, reports stable metrics and responds to changed row heights', () => {
    cy.visit('/markdown-root.html');
    control('Settle');
    readMetrics().then((metrics) => {
      expect(metrics.measuredCount).to.equal(80);
      expect(metrics.estimatedCount).to.equal(0);
      cy.get('.markdown-renderer')
        .invoke('prop', 'clientWidth')
        .then((width) => expect(metrics.width).to.equal(width));
      expect(metrics.stable).to.equal(true);
      expect(metrics.confidence).to.equal('measured');
      expect(metrics.finals).to.be.greaterThan(0);
      const before = metrics.totalHeight;
      control('Change row');
      cy.get('[data-testid="event-reasons"]').should(($output) => {
        const reasons = JSON.parse($output.text());
        expect(reasons.height).to.equal('node-resize');
        expect(reasons.state).to.equal(reasons.height);
      });
      control('Measure');
      readMetrics().then((next) => {
        expect(next.totalHeight).to.equal(before + 64);
        expect(next.reason).to.equal('manual');
      });
    });
  });
  it('scrolls, captures a measured anchor, restores cache without scrolling and restores the explicit anchor', () => {
    cy.visit('/markdown-root.html');
    control('Settle');
    control('Scroll middle');
    cy.get('[data-testid="scroll-frame"]').should(($frame) =>
      expect($frame[0].scrollTop).to.be.greaterThan(1000),
    );
    control('Capture');
    readMetrics().then((state) => {
      expect(state.anchorCaptured).to.equal(true);
      expect(state.anchor.type).to.equal('node');
      expect(state.anchor.nodeIndex).to.equal(40);
      expect(state.heightCache).to.have.length(80);
      control('Top');
      cy.get('[data-testid="scroll-frame"]').should(($frame) =>
        expect($frame[0].scrollTop).to.equal(0),
      );
      control('Restore cache');
      cy.get('[data-testid="scroll-frame"]').should(($frame) =>
        expect($frame[0].scrollTop).to.equal(0),
      );
      control('Restore anchor');
      cy.get('[data-testid="scroll-frame"]').should(($frame) =>
        expect($frame[0].scrollTop).to.be.greaterThan(1000),
      );
      cy.get('[data-row="40"]').then(($row) =>
        cy
          .get('[data-testid="scroll-frame"]')
          .should(($frame) =>
            expect(
              Math.abs($row[0].getBoundingClientRect().top - $frame[0].getBoundingClientRect().top),
            ).to.be.lessThan(2),
          ),
      );
    });
  });
  it('keeps manual settlement pending until explicitly requested and rejects a previous session anchor', () => {
    cy.visit('/markdown-root.html?manual');
    control('Read');
    readMetrics().then((metrics) => {
      expect(metrics.stable).to.equal(false);
      expect(metrics.finals).to.equal(0);
    });
    control('Settle');
    readMetrics().then((metrics) => expect(metrics.stable).to.equal(true));
    control('Scroll middle');
    control('Capture');
    control('Change session');
    control('Top');
    control('Restore anchor');
    cy.get('[data-testid="scroll-frame"]').should(($frame) =>
      expect($frame[0].scrollTop).to.equal(0),
    );
    control('Settle');
    readMetrics().then((metrics) => expect(metrics.sessionKey).to.equal('two'));
  });
  it('bounds live DOM and scrolls an initially unmounted node into the actual viewport', () => {
    cy.visit('/markdown-root.html?virtual');
    cy.get('.node-slot').should('have.length.at.most', 12);
    control('Settle');
    readMetrics().then((metrics) => {
      expect(metrics.nodeCount).to.equal(200);
      expect(metrics.estimatedCount).to.be.greaterThan(0);
    });
    control('Scroll middle');
    cy.get('[data-row="100"]').should('exist');
    control('Settle');
    cy.get('[data-row="100"]').then(($row) =>
      cy
        .get('[data-testid="scroll-frame"]')
        .should(($frame) =>
          expect(
            Math.abs($row[0].getBoundingClientRect().top - $frame[0].getBoundingClientRect().top),
          ).to.be.lessThan(3),
        ),
    );
    cy.get('.node-slot').should('have.length.at.most', 12);
  });
  it('waits for a real asynchronous image instead of equating final input with settled rendering', () => {
    let release: (() => void) | undefined;
    cy.intercept(
      '/markdown-root-image.svg',
      (request) =>
        new Cypress.Promise<void>((resolve) => {
          release = () => {
            request.reply({
              headers: { 'content-type': 'image/svg+xml' },
              body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="red"/></svg>',
            });
            resolve();
          };
        }),
    );
    cy.visit('/markdown-root.html');
    control('Settle');
    control('Add image');
    cy.wrap(null).should(() => expect(release).to.be.a('function'));
    control('Settle early');
    readMetrics().then((metrics) => {
      expect(metrics.nodeCount).to.equal(81);
      expect(metrics.stable).to.equal(false);
    });
    cy.then(() => release!());
    cy.get('.sd-markdown-render-image img').should(($image) =>
      expect(($image[0] as HTMLImageElement).naturalWidth).to.equal(80),
    );
    control('Settle');
    readMetrics().then((metrics) => {
      expect(metrics.stable).to.equal(true);
      expect(metrics.nodeCount).to.equal(81);
    });
  });
  it('normalizes a column-reverse scroll root when scrolling and capturing its anchor', () => {
    cy.visit('/markdown-root.html?reverse');
    control('Settle');
    control('Top');
    cy.get('[data-testid="scroll-frame"]').should(($frame) =>
      expect($frame[0].scrollTop).to.be.lessThan(-1000),
    );
    control('Scroll middle');
    cy.get('[data-row="40"]').then(($row) =>
      cy
        .get('[data-testid="scroll-frame"]')
        .should(($frame) =>
          expect(
            Math.abs($row[0].getBoundingClientRect().top - $frame[0].getBoundingClientRect().top),
          ).to.be.lessThan(2),
        ),
    );
    control('Capture');
    readMetrics().then((state) => {
      expect(state.anchorCaptured).to.equal(true);
      expect(state.anchor.nodeIndex).to.equal(40);
    });
  });
  it('reconnects measurement and settlement after an actual unmount and remount', () => {
    cy.visit('/markdown-root.html');
    control('Settle');
    for (let index = 0; index < 3; index++) {
      control('Toggle renderer');
      cy.get('.markdown-renderer').should('not.exist');
      control('Toggle renderer');
      cy.get('.markdown-renderer').should('exist');
    }
    control('Settle');
    readMetrics().then((metrics) => {
      expect(metrics.stable).to.equal(true);
      expect(metrics.measuredCount).to.equal(80);
    });
  });
});
