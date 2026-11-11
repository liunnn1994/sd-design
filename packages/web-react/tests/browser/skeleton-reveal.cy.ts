import { checkComponentDocs } from './docs-contract';

describe('SkeletonReveal', () => {
  beforeEach(() => cy.visit('/'));
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );
  it('waits offscreen in StrictMode, renders an initial outline and autoplays once', () => {
    cy.get('[data-testid="reveal-auto"]').should('have.attr', 'data-state', 'idle');
    cy.get('[data-testid="reveal-auto"] [data-reveal-initial]').should('exist');
    cy.get('[data-testid="reveal-auto"] .sd-skeleton-reveal-content').should(
      'have.css',
      'opacity',
      '0',
    );
    cy.get('[data-testid="reveal-auto"]')
      .scrollIntoView()
      .should('have.attr', 'data-state', 'drawing');
    cy.get('[data-testid="reveal-auto"]').should('have.attr', 'data-state', 'complete');
    cy.get('[data-testid="reveal-auto"] .sd-skeleton-reveal-overlay').should('not.exist');
    cy.scrollTo('top');
    cy.get('[data-testid="reveal-auto"]')
      .scrollIntoView()
      .should('have.attr', 'data-state', 'complete');
  });
  it('draws measured SVG contours, interpolates real animations and finishes once', () => {
    cy.contains('button', 'Reveal short').click();
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"] [data-reveal-draw]')
      .should('have.length', 4)
      .first()
      .should((rect) =>
        expect(parseFloat(getComputedStyle(rect[0]).strokeDashoffset)).to.be.lessThan(0.95),
      );
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'complete');
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('[data-testid="reveal-finish-count"]').should('have.text', '1');
    cy.get('[data-testid="reveal-main"]').should((root) =>
      expect(
        root[0]
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running'),
      ).to.have.length(0),
    );
  });
  it('finishes on focus and pointer input without swallowing the first interaction', () => {
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'drawing');
    cy.get('[aria-label="Reveal draft"]')
      .focus()
      .type('draft')
      .should('have.value', 'draft')
      .and('be.focused');
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'complete');
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'drawing');
    cy.contains('button', 'Reveal create').click();
    cy.get('[data-testid="reveal-click-count"]').should('have.text', '1');
    cy.get('[data-testid="reveal-finish-count"]').should('have.text', '2');
  });
  it('cancels obsolete replays and reveals content after resize or leaving the viewport', () => {
    cy.contains('button', 'Reveal twice').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'drawing');
    cy.contains('button', 'Reveal resize').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'complete');
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-content').should(
      'have.css',
      'opacity',
      '1',
    );
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"]')
      .should('have.attr', 'data-state', 'drawing')
      .invoke('css', 'transform', 'translateY(-3000px)');
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'complete');
  });
  it('honors disabled, zero duration and live reduced-motion changes', () => {
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'drawing');
    cy.contains('button', 'Reveal disabled').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'complete');
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-overlay').should('not.exist');
    cy.contains('button', 'Reveal disabled').click();
    cy.contains('button', 'Reveal zero').click();
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-overlay').should('not.exist');
    cy.contains('button', 'Reveal long').click();
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'drawing');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    cy.get('[data-testid="reveal-auto"] .sd-skeleton-reveal-content').should(
      'have.css',
      'opacity',
      '1',
    );
    cy.get('[data-testid="reveal-auto"] .sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'complete');
    cy.visit('/');
    cy.get('[data-testid="reveal-auto"] .sd-skeleton-reveal-content').should(
      'have.css',
      'opacity',
      '1',
    );
    cy.get('[data-testid="reveal-auto"] .sd-skeleton-reveal-overlay').should('not.exist');
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-overlay').should('not.exist');
  });
  it('updates theme tokens, uses unique masks and clears running animations on unmount', () => {
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-overlay > rect')
      .should('have.css', 'stroke', 'rgb(18, 52, 86)')
      .and('have.css', 'stroke-width', '8px');
    cy.contains('button', 'Reveal theme').click();
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-overlay > rect')
      .should('have.css', 'stroke', 'rgb(0, 170, 102)')
      .and('have.css', 'stroke-width', '2px');
    cy.get('[data-testid="reveal-main"] [data-reveal-draw]').should(
      'have.css',
      'stroke-width',
      '5px',
    );
    cy.contains('button', 'Reveal second').click();
    cy.get('[data-testid="reveal-fixture"] mask').then((masks) => {
      const ids = [...masks].map((mask) => mask.id);
      expect(new Set(ids).size).to.equal(ids.length);
    });
    cy.get('[data-testid="reveal-main"]').then((root) =>
      cy
        .wrap({ animations: root[0].getAnimations({ subtree: true }) })
        .as('revealAnimations', { type: 'static' }),
    );
    cy.contains('button', 'Reveal mount').click();
    cy.get('[data-testid="reveal-main"]').should('not.exist');
    cy.get<{ animations: Animation[] }>('@revealAnimations').then((saved) =>
      expect(saved.animations.every((animation) => animation.playState === 'idle')).to.equal(true),
    );
    cy.get('[data-testid="reveal-finish-count"]').should('have.text', '0');
    cy.contains('button', 'Reveal mount').click();
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'drawing');
  });
  it('caps measured outlines and exposes immediate finish', () => {
    cy.contains('button', 'Reveal many').click();
    cy.get('[data-testid="reveal-main"] p').should('have.length', 100);
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"] [data-reveal-draw]').should('have.length', 24);
    cy.contains('button', 'Reveal finish').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'complete');
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-overlay').should('not.exist');
  });
  it('starts after a native instant scroll without waiting for the initial observation', () => {
    cy.get('[data-testid="reveal-auto"]').then((root) =>
      root[0].scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    cy.get('[data-testid="reveal-auto"]').should('have.attr', 'data-state', 'drawing');
    cy.get('[data-testid="reveal-auto"]').should('have.attr', 'data-state', 'complete');
  });
  it('finishes when the document hides and rejects replay until visible again', () => {
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'drawing');
    cy.document().then((document) => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'complete');
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"] .sd-skeleton-reveal-overlay').should('not.exist');
    cy.document().then((document) => {
      Reflect.deleteProperty(document, 'hidden');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    cy.contains('button', 'Reveal replay').click();
    cy.get('[data-testid="reveal-main"]').should('have.attr', 'data-state', 'drawing');
  });
});

describe('SkeletonReveal documentation', () => {
  it('documents shared skeleton-reveal scenes and framework navigation', () =>
    checkComponentDocs('skeleton-reveal'));
});
