import { checkComponentDocs } from './docs-contract';

describe('ThinkingOrb React', () => {
  const main = '[data-testid="orb-main"]';
  const snapshot = (canvas: HTMLCanvasElement) => canvas.toDataURL();
  const twoFrames = (canvas: HTMLCanvasElement) =>
    new Promise<void>((resolve) => {
      const win = canvas.ownerDocument.defaultView!;
      win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
    });
  beforeEach(() => {
    cy.visit('/');
    cy.get(main).scrollIntoView();
  });
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );
  it('draws all nine states and resolves the native ref, size and locale', () => {
    cy.get<HTMLCanvasElement>(main).should((canvas) => {
      expect(canvas[0].width).to.eq(
        Math.round(64 * Math.min(2, canvas[0].ownerDocument.defaultView!.devicePixelRatio)),
      );
      expect(
        canvas[0]
          .getContext('2d')!
          .getImageData(0, 0, canvas[0].width, canvas[0].height)
          .data.some((value) => value !== 0),
      ).to.eq(true);
    });
    cy.get('[data-testid="orb-fixture"] canvas[data-state]').should('have.length', 11);
    cy.get<HTMLCanvasElement>('[data-testid="orb-fixture"] canvas[data-state]').each((canvas) => {
      const node = canvas[0] as HTMLCanvasElement;
      expect(
        node
          .getContext('2d')!
          .getImageData(0, 0, node.width, node.height)
          .data.some((value) => value !== 0),
      ).to.eq(true);
    });
    cy.contains('button', 'Orb size').click();
    cy.get(main).should('have.css', 'width', '20px');
    cy.contains('button', 'Orb locale').click();
    cy.get(main).should('have.attr', 'aria-label', 'Working…');
    cy.contains('button', 'Orb ref').click();
    cy.get('[data-testid="orb-ref"]').should('have.text', 'CANVAS');
  });
  it('animates, pauses deterministically and resumes with negative speed', () => {
    cy.get<HTMLCanvasElement>(main).then((canvas) => {
      const initial = snapshot(canvas[0]);
      cy.get<HTMLCanvasElement>(main).should((next) =>
        expect(snapshot(next[0])).not.to.eq(initial),
      );
    });
    cy.contains('button', 'Orb pause').click();
    cy.get<HTMLCanvasElement>(main).then(async (canvas) => {
      const still = snapshot(canvas[0]);
      await twoFrames(canvas[0]);
      expect(snapshot(canvas[0])).to.eq(still);
    });
    cy.contains('button', 'Orb reverse').click();
    cy.contains('button', 'Orb pause').click();
    cy.get<HTMLCanvasElement>(main).then((canvas) => {
      const initial = snapshot(canvas[0]);
      cy.get<HTMLCanvasElement>(main).should((next) =>
        expect(snapshot(next[0])).not.to.eq(initial),
      );
    });
  });
  it('inherits live theme while preserving an explicit light override', () => {
    cy.contains('button', 'Orb pause').click();
    cy.get<HTMLCanvasElement>(main).then((canvas) => {
      const light = snapshot(canvas[0]);
      cy.contains('button', 'Orb theme').click();
      cy.get(main).should('have.attr', 'data-theme', 'dark');
      cy.get<HTMLCanvasElement>(main).should((next) => expect(snapshot(next[0])).not.to.eq(light));
    });
    cy.get('[data-testid="orb-explicit"]').should('have.attr', 'data-theme', 'light');
  });
  it('renders a stable representative frame under live and initial reduced motion', () => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    cy.window().should((win) =>
      expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).to.eq(true),
    );
    cy.get<HTMLCanvasElement>(main).then(async (canvas) => {
      await twoFrames(canvas[0]);
      const still = snapshot(canvas[0]);
      await twoFrames(canvas[0]);
      expect(snapshot(canvas[0])).to.eq(still);
    });
    cy.reload();
    cy.get<HTMLCanvasElement>(main).then(async (canvas) => {
      const still = snapshot(canvas[0]);
      await twoFrames(canvas[0]);
      expect(snapshot(canvas[0])).to.eq(still);
    });
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    );
    cy.get<HTMLCanvasElement>(main).then((canvas) => {
      const still = snapshot(canvas[0]);
      cy.get<HTMLCanvasElement>(main).should((next) => expect(snapshot(next[0])).not.to.eq(still));
    });
  });
  it('stops offscreen and restarts after instant reentry', () => {
    cy.get<HTMLCanvasElement>(main).then((canvas) => {
      const node = canvas[0];
      cy.window().then((win) => win.scrollTo({ top: 0, behavior: 'instant' }));
      cy.then(async () => {
        await twoFrames(node);
        const still = snapshot(node);
        await twoFrames(node);
        expect(snapshot(node)).to.eq(still);
      });
      cy.get(main).then((current) =>
        current[0].scrollIntoView({ block: 'center', behavior: 'instant' }),
      );
      cy.then(() => {
        const still = snapshot(node);
        cy.get<HTMLCanvasElement>(main).should((current) =>
          expect(snapshot(current[0])).not.to.eq(still),
        );
      });
    });
  });
  it('stops on hidden documents and releases the canvas ref on unmount', () => {
    cy.document().then((document) => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    cy.get<HTMLCanvasElement>(main).then(async (canvas) => {
      const still = snapshot(canvas[0]);
      await twoFrames(canvas[0]);
      expect(snapshot(canvas[0])).to.eq(still);
    });
    cy.document().then((document) => {
      Reflect.deleteProperty(document, 'visibilityState');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    cy.get<HTMLCanvasElement>(main).then((canvas) => {
      const still = snapshot(canvas[0]);
      cy.get<HTMLCanvasElement>(main).should((next) => expect(snapshot(next[0])).not.to.eq(still));
    });
    cy.get<HTMLCanvasElement>(main).then((canvas) => {
      const node = canvas[0];
      cy.contains('button', 'Orb mount').click();
      cy.get(main).should('not.exist');
      cy.then(async () => {
        const still = snapshot(node);
        await twoFrames(node);
        expect(snapshot(node)).to.eq(still);
      });
    });
    cy.contains('button', 'Orb ref').click();
    cy.get('[data-testid="orb-ref"]').should('have.text', 'null');
    cy.contains('button', 'Orb mount').click();
    cy.get(main).should('be.visible');
  });
});

describe('ThinkingOrb documentation', () => {
  it('documents shared thinking-orb scenes and framework navigation', () =>
    checkComponentDocs('thinking-orb'));
});
