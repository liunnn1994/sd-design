import { checkComponentDocs } from './docs-contract';

describe('BorderBeam React', () => {
  const root = '[data-testid="beam-main"]';
  const style = () =>
    cy
      .get(root)
      .invoke('attr', 'data-beam')
      .then((id) => cy.get(`style[data-beam-style="${id}"]`));
  const twoFrames = (node: HTMLElement) =>
    new Promise<void>((resolve) => {
      const win = node.ownerDocument.defaultView!;
      win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
    });
  beforeEach(() => {
    cy.visit('/');
    cy.get(root).scrollIntoView();
  });
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );
  it('injects one style per instance and preserves content and inactive SSR state in StrictMode', () => {
    cy.get(root).should('not.have.attr', 'data-active');
    cy.get(root).find('[data-beam-bloom]').should('have.length', 1);
    cy.get('style[data-beam-style]').should('have.length', 2);
    cy.get('[data-testid="beam-fixture"] [data-beam]').then((elements) =>
      expect(
        new Set(elements.toArray().map((element) => element.getAttribute('data-beam'))).size,
      ).to.eq(2),
    );
    cy.contains('button', 'Beam child action').focus().should('have.focus');
    cy.contains('button', 'Beam ref').click();
    cy.get('[data-testid="beam-ref"]').should('have.text', 'connected');
  });
  it('runs real fade-in/out and publishes the component callbacks', () => {
    cy.contains('button', 'Beam active').click();
    cy.get(root).should('have.attr', 'data-active');
    cy.get('[data-testid="beam-events"]').should('contain.text', 'activate');
    cy.contains('button', 'Beam active').click();
    cy.get('[data-testid="beam-events"]').should('contain.text', 'deactivate');
    cy.get(root).should('not.have.attr', 'data-active');
    cy.get(root).should('not.have.attr', 'data-fading');
  });
  it('ignores foreign and pseudo animation events and reverses a pending fade', () => {
    cy.get(root).then((element) => {
      const id = element.attr('data-beam');
      element[0].dispatchEvent(
        new AnimationEvent('animationend', { bubbles: true, animationName: 'fade-in-up' }),
      );
      element[0].dispatchEvent(
        new AnimationEvent('animationend', {
          bubbles: true,
          animationName: `beam-fade-in-${id}`,
          pseudoElement: '::after',
        }),
      );
    });
    cy.get('[data-testid="beam-events"]').should('have.text', '');
    cy.contains('button', 'Beam active').click();
    cy.get('[data-testid="beam-events"]').should('contain.text', 'activate');
    cy.contains('button', 'Beam active').then((button) => {
      button[0].click();
    });
    cy.get(root).should('have.attr', 'data-fading');
    cy.contains('button', 'Beam active').click();
    cy.get(root).should('have.attr', 'data-active');
    cy.get(root).should('not.have.attr', 'data-fading');
  });
  it('measures flow SVG geometry, accepts coordinates and reconciles controlled inactive state', () => {
    cy.contains('button', 'Beam default flow').click();
    cy.get(`${root} [data-beam-flow]`).should('have.attr', 'viewBox', '0 0 350 140');
    cy.get(root)
      .should('have.css', '--beam-flow-x', '350px')
      .and('have.css', '--beam-flow-y', '0px');
    cy.get(`${root} [data-beam-flow-blob]`).should('have.length', 3);
    cy.get(`${root} [data-beam-flow]`).should('not.exist');
    cy.get(root).should('not.have.attr', 'data-active');
    cy.get(root).should('not.have.attr', 'data-fading');
    cy.contains('button', 'Beam center flow').click();
    cy.get(root)
      .should('have.css', '--beam-flow-x', '175px')
      .and('have.css', '--beam-flow-y', '70px');
    cy.contains('button', 'Beam custom flow').click();
    cy.get(root)
      .should('have.css', '--beam-flow-x', '25px')
      .and('have.css', '--beam-flow-y', '30px');
    cy.get(`${root} [data-beam-flow-sheet]`).should('have.attr', 'rx', '12');
  });
  it('keeps active beams after flow and isolates multiple SVG masks', () => {
    cy.contains('button', 'Beam active').click();
    cy.contains('button', 'Beam center flow').click();
    cy.contains('button', 'Beam second flow').click();
    cy.get('[data-testid="beam-fixture"] mask').then((masks) => {
      expect(masks).to.have.length(2);
      expect(new Set(masks.toArray().map((mask) => mask.id)).size).to.eq(2);
    });
    cy.get(`${root} [data-beam-flow]`).should('not.exist');
    cy.get(root).should('have.attr', 'data-active');
  });
  it('tracks child radius and replacement while honoring explicit tuning', () => {
    style().should('contain.text', 'border-radius: 12px');
    cy.contains('button', 'Beam child radius').click();
    style().should('contain.text', 'border-radius: 24px');
    cy.contains('button', 'Beam replace child').click();
    cy.contains('button', 'Beam child radius').click();
    style().should('contain.text', 'border-radius: 12px');
    cy.contains('button', 'Beam tuning').click();
    style()
      .should('contain.text', 'border-radius: 5px')
      .and('contain.text', '7s linear infinite')
      .and('contain.text', 'brightness(2.00)')
      .and('contain.text', 'saturate(3.00)');
    cy.get(root)
      .should('have.css', '--beam-strength', '1')
      .and('have.css', '--beam-density', '0.1');
  });
  it('supports all sizes, line hue limits, color variants and static colors', () => {
    cy.contains('button', 'Beam tuning').click();
    cy.get('[aria-label="Beam size"]').select('sm');
    style().should('contain.text', '7s linear infinite');
    cy.get('[aria-label="Beam size"]').select('line');
    style()
      .should('contain.text', 'hue-rotate(-13deg)')
      .and('not.contain.text', 'hue-rotate(-50deg)');
    cy.get('[aria-label="Beam size"]').select('pulse-inner');
    cy.contains('button', 'Beam active').click();
    cy.get(root).should((element) => expect(element[0].style.cssText).to.contain('--bw1-'));
    cy.get('[aria-label="Beam size"]').select('pulse-outside');
    cy.get(root).should('have.css', '--pulse-glow-sx', '1');
    cy.get('[aria-label="Beam size"]').select('md');
    cy.get('[aria-label="Beam color"]').select('ocean');
    cy.get('[aria-label="Beam color"]').select('sunset');
    cy.get('[aria-label="Beam color"]').select('mono');
    style().should('not.contain.text', 'beam-hue-shift');
    cy.get('[aria-label="Beam color"]').select('colorful');
    cy.contains('button', 'Beam static colors').click();
    style().should('not.contain.text', 'beam-hue-shift');
  });
  it('remeasures pulse glow on resize, child replacement and empty content', () => {
    cy.get('[aria-label="Beam size"]').select('pulse-outside');
    cy.get(root).should('have.css', '--pulse-glow-sx', '1').and('have.css', '--pulse-glow-sy', '1');
    cy.contains('button', 'Beam resize').click();
    cy.get(root).should('have.css', '--pulse-glow-sx', '2').and('have.css', '--pulse-glow-sy', '2');
    cy.contains('button', 'Beam replace child').click();
    cy.contains('button', 'Beam resize').click();
    cy.get(root).should('have.css', '--pulse-glow-sx', '1');
    cy.contains('button', 'Beam empty').click();
    cy.get(root).should('have.css', '--pulse-glow-sx', '1');
  });
  it('follows system auto theme while explicit themes remain authoritative', () => {
    cy.get('[aria-label="Beam theme"]').select('auto');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-color-scheme', value: 'light' }] },
      }),
    );
    style().should('contain.text', 'rgba(0, 0, 0, 0.08)');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-color-scheme', value: 'dark' }] },
      }),
    );
    style().should('not.contain.text', 'rgba(0, 0, 0, 0.08)');
    cy.get('[aria-label="Beam theme"]').select('light');
    style().should('contain.text', 'rgba(0, 0, 0, 0.08)');
  });
  it('pauses pulse work outside the viewport and releases style, driver and ref on unmount', () => {
    cy.get('[aria-label="Beam size"]').select('pulse-inner');
    cy.contains('button', 'Beam active').click();
    cy.get(root).should((element) => expect(element[0].style.cssText).to.contain('--bw1-'));
    cy.window().then((win) => win.scrollTo({ top: 0, behavior: 'instant' }));
    cy.get(root).should('have.attr', 'data-paused');
    cy.get(root).then(async (element) => {
      const still = element[0].style.cssText;
      await twoFrames(element[0]);
      expect(element[0].style.cssText).to.eq(still);
    });
    cy.get(root).scrollIntoView().should('not.have.attr', 'data-paused');
    cy.get(root).then((element) => {
      const node = element[0];
      const id = node.getAttribute('data-beam');
      cy.contains('button', 'Beam mount').click();
      cy.get(`style[data-beam-style="${id}"]`).should('not.exist');
      cy.then(async () => {
        const still = node.style.cssText;
        await twoFrames(node);
        expect(node.style.cssText).to.eq(still);
      });
    });
    cy.contains('button', 'Beam ref').click();
    cy.get('[data-testid="beam-ref"]').should('have.text', 'null');
    cy.contains('button', 'Beam mount').click();
    cy.get('style[data-beam-style]').should('have.length', 2);
  });
  it('stops pulse animation for reduced motion and skips one-shot flow when inactive', () => {
    cy.get('[aria-label="Beam size"]').select('pulse-inner');
    cy.contains('button', 'Beam active').click();
    cy.get(root).should((element) => expect(element[0].style.cssText).to.contain('--bw1-'));
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    cy.window().should((win) =>
      expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).to.eq(true),
    );
    cy.get(root).then(async (element) => {
      await twoFrames(element[0]);
      const still = element[0].style.cssText;
      await twoFrames(element[0]);
      expect(element[0].style.cssText).to.eq(still);
    });
    cy.contains('button', 'Beam active').click();
    cy.get(root).should('not.have.attr', 'data-active');
    cy.get('[data-testid="beam-events"]').should('contain.text', 'deactivate');
    cy.contains('button', 'Beam center flow').click();
    cy.get(root).should('not.have.attr', 'data-active');
    cy.get(`${root} [data-beam-flow]`).should('not.exist');
  });
});

describe('BorderBeam documentation', () => {
  it('documents shared border-beam scenes and framework navigation', () =>
    checkComponentDocs('border-beam'));
});
