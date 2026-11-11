import { checkComponentDocs } from './docs-contract';

describe('LiquidGlassLogo React', () => {
  const root = '[data-testid="glass-main"]';
  const canvasSelector = `${root} canvas`;
  const context = (canvas: HTMLCanvasElement) => canvas.getContext('webgl2')!;
  const time = (canvas: HTMLCanvasElement) => {
    const gl = context(canvas);
    const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
    return Number(gl.getUniform(program, gl.getUniformLocation(program, 'uTime')!));
  };
  const twoFrames = (canvas: HTMLCanvasElement) =>
    new Promise<void>((resolve) => {
      const win = canvas.ownerDocument.defaultView!;
      win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
    });
  const visit = () => {
    cy.visit('/');
    cy.get(root).scrollIntoView().should('have.attr', 'data-liquid-glass-ready');
  };
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );
  it('renders real WebGL pixels and exposes seek/replay with one ready event in StrictMode', () => {
    visit();
    cy.get<HTMLCanvasElement>(canvasSelector).then((canvas) => {
      const node = canvas[0];
      const gl = context(node);
      const seek = Array.from(node.ownerDocument.querySelectorAll('button')).find(
        (button) => button.textContent === 'Glass seek',
      )!;
      seek.click();
      gl.finish();
      const pixels = new Uint8Array(node.width * node.height * 4);
      gl.readPixels(0, 0, node.width, node.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      expect(pixels.some((value) => value > 0)).to.eq(true);
      expect(time(node)).to.be.closeTo(0.5, 0.0001);
    });
    cy.contains('button', 'Glass replay').click();
    cy.get<HTMLCanvasElement>(canvasSelector).should((canvas) => expect(time(canvas[0])).to.eq(0));
    cy.get('[data-testid="glass-events"]').should('have.text', 'ready');
    cy.contains('button', 'Glass ref').click();
    cy.get('[data-testid="glass-ref"]').should('have.text', 'connected');
  });
  it('plays and pauses imperatively, then follows updated paused props', () => {
    visit();
    cy.contains('button', 'Glass play').click();
    cy.get<HTMLCanvasElement>(canvasSelector).should((canvas) =>
      expect(time(canvas[0])).to.be.greaterThan(0.1),
    );
    cy.contains('button', 'Glass pause').click();
    cy.get<HTMLCanvasElement>(canvasSelector).then(async (canvas) => {
      const still = time(canvas[0]);
      await twoFrames(canvas[0]);
      expect(time(canvas[0])).to.eq(still);
    });
    cy.contains('button', 'Glass paused prop').click();
    cy.get<HTMLCanvasElement>(canvasSelector).then((canvas) => {
      const still = time(canvas[0]);
      cy.get<HTMLCanvasElement>(canvasSelector).should((next) =>
        expect(time(next[0])).to.be.greaterThan(still),
      );
    });
    cy.contains('button', 'Glass paused prop').click();
    cy.contains('button', 'Glass seek').click();
    cy.get<HTMLCanvasElement>(canvasSelector).then(async (canvas) => {
      await twoFrames(canvas[0]);
      expect(time(canvas[0])).to.eq(0.5);
    });
  });
  it('measures changing wordmarks and honors auto-width, explicit width and small height', () => {
    visit();
    cy.get(root).should('have.css', 'width', '82px');
    cy.contains('button', 'Glass text').click();
    cy.get(root).should((element) =>
      expect(element[0].getBoundingClientRect().width).to.be.greaterThan(82),
    );
    cy.contains('button', 'Glass auto width').click();
    cy.get(root).should('have.css', 'width', '600px');
    cy.contains('button', 'Glass css width').click();
    cy.get(root).should('have.css', 'width', '180px');
    cy.contains('button', 'Glass auto width').click();
    cy.contains('button', 'Glass height').click();
    cy.get(root).should('have.css', 'height', '20px').and('have.css', 'width', '180px');
    cy.get(root).should('have.attr', 'aria-label', 'Long React 字标');
  });
  it('resolves live page, library and explicit themes with the same precedence as Vue', () => {
    visit();
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'light');
    cy.contains('button', 'Glass page theme').click();
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
    cy.contains('button', 'Glass library theme').click();
    cy.contains('button', 'Glass page theme').click();
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
    cy.contains('button', 'Glass explicit theme').click();
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'light');
    cy.contains('button', 'Glass explicit theme').click();
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
    cy.contains('button', 'Glass library theme').click();
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'light');
  });
  it('uses browser preference and a single CSS color scheme when page and library themes are absent', () => {
    visit();
    cy.get('[data-testid="glass-fixture"]').invoke('removeAttr', 'data-theme');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-color-scheme', value: 'dark' }] },
      }),
    );
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'dark');
    cy.get('[data-testid="glass-fixture"]').then((element) => {
      element[0].style.colorScheme = 'light';
      element[0].setAttribute('data-theme', 'light');
      element[0].removeAttribute('data-theme');
    });
    cy.get(root).should('have.attr', 'data-liquid-glass-theme', 'light');
  });
  it('clamps background transforms and updates the accessible ending', () => {
    visit();
    cy.contains('button', 'Glass background').click();
    cy.get(`${root} .sd-liquid-glass-logo-background`)
      .should('have.length', 2)
      .first()
      .should('have.attr', 'style')
      .and('contain', 'translate(100%, -100%) scale(3)');
    cy.get(`${root} .sd-liquid-glass-logo-background`).last().should('have.css', 'opacity', '1');
    cy.contains('button', 'Glass ending').click();
    cy.get(root).should('have.attr', 'aria-label', 'Logo');
  });
  it('falls back without WebGL, reports one error and supports a custom fallback', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        const original = win.HTMLCanvasElement.prototype.getContext;
        cy.stub(win.HTMLCanvasElement.prototype, 'getContext').callsFake(function (
          this: HTMLCanvasElement,
          ...args: Parameters<typeof original>
        ) {
          return args[0] === 'webgl2' ? null : Reflect.apply(original, this, args);
        });
      },
    });
    cy.get(root).scrollIntoView().should('have.attr', 'data-liquid-glass-fallback');
    cy.get(`${root} .sd-liquid-glass-logo-fallback`).should('have.text', 'SD');
    cy.get('[data-testid="glass-events"]').should('have.text', 'error:WebGL2 is unavailable.');
    cy.contains('button', 'Glass custom fallback').click();
    cy.get(`${root} .sd-liquid-glass-logo-fallback strong`).should(
      'have.text',
      'Static React brand',
    );
    cy.contains('button', 'Glass replay').click();
    cy.get(root).should('not.have.attr', 'data-liquid-glass-ready');
  });
  it('cleans GPU resources on context loss and displays the fallback', () => {
    visit();
    cy.get<HTMLCanvasElement>(canvasSelector).then((canvas) => {
      const gl = context(canvas[0]);
      cy.spy(gl, 'deleteProgram').as('glassPrograms');
      cy.spy(gl, 'deleteTexture').as('glassTextures');
      gl.getExtension('WEBGL_lose_context')!.loseContext();
    });
    cy.get(root).should('have.attr', 'data-liquid-glass-fallback');
    cy.get(root).should('not.have.attr', 'data-liquid-glass-ready');
    cy.get('@glassPrograms').should('have.callCount', 2);
    cy.get('@glassTextures').should('have.callCount', 3);
    cy.get('[data-testid="glass-events"]').should('have.text', 'ready|error:WebGL context lost.');
  });
  it('keeps rendering without a failed image and releases resources on ordinary unmount', () => {
    visit();
    cy.get<HTMLCanvasElement>(canvasSelector).then((canvas) => {
      cy.spy(context(canvas[0]), 'deleteProgram').as('glassUnmountPrograms');
    });
    cy.contains('button', 'Glass mount').click();
    cy.get(root).should('not.exist');
    cy.get('@glassUnmountPrograms').should('have.callCount', 2);
    cy.contains('button', 'Glass ref').click();
    cy.get('[data-testid="glass-ref"]').should('have.text', 'null');
    cy.contains('button', 'Glass mount').click();
    cy.get(root).should('have.attr', 'data-liquid-glass-ready');
    cy.get<HTMLCanvasElement>(canvasSelector).then((canvas) => {
      cy.spy(context(canvas[0]), 'texImage2D').as('glassRaster');
    });
    cy.contains('button', 'Glass broken image').click();
    cy.get('@glassRaster').should('have.been.called');
    cy.get(root).should('have.attr', 'data-liquid-glass-ready');
    cy.get(root).should('not.have.attr', 'data-liquid-glass-fallback');
    cy.get('[data-testid="glass-events"]').should('have.text', 'ready|ready');
  });
  it('falls back after shader compilation failure and reports one setup error', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.WebGL2RenderingContext.prototype, 'getShaderParameter').returns(false);
        cy.spy(win.WebGL2RenderingContext.prototype, 'deleteProgram').as('glassFailedProgram');
      },
    });
    cy.get(root).scrollIntoView().should('have.attr', 'data-liquid-glass-fallback');
    cy.get('@glassFailedProgram').should('have.been.called');
    cy.get('[data-testid="glass-events"]').should((element) => {
      expect(element.text().split('|')).to.have.length(1);
      expect(element.text()).to.contain('error:');
    });
  });
  it('stops the WebGL clock outside the viewport and resumes after instant reentry', () => {
    visit();
    cy.contains('button', 'Glass play').click();
    cy.get<HTMLCanvasElement>(canvasSelector).should((canvas) =>
      expect(time(canvas[0])).to.be.greaterThan(0.1),
    );
    cy.get<HTMLCanvasElement>(canvasSelector).then((canvas) => {
      const node = canvas[0];
      cy.window().then((win) => win.scrollTo({ top: 0, behavior: 'instant' }));
      cy.then(async () => {
        await twoFrames(node);
        const still = time(node);
        await twoFrames(node);
        expect(time(node)).to.eq(still);
      });
      cy.get(root).then((element) =>
        element[0].scrollIntoView({ behavior: 'instant', block: 'center' }),
      );
      cy.then(() => {
        const still = time(node);
        cy.get<HTMLCanvasElement>(canvasSelector).should((next) =>
          expect(time(next[0])).to.be.greaterThan(still),
        );
      });
    });
  });
  it('holds the final WebGL frame under reduced motion and resumes after the preference changes', () => {
    visit();
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    cy.window().should((win) =>
      expect(win.matchMedia('(prefers-reduced-motion: reduce)').matches).to.eq(true),
    );
    cy.contains('button', 'Glass seek').click();
    cy.get<HTMLCanvasElement>(canvasSelector).should((canvas) =>
      expect(time(canvas[0])).to.be.greaterThan(3),
    );
    cy.reload();
    cy.get(root).scrollIntoView().should('have.attr', 'data-liquid-glass-ready');
    cy.get<HTMLCanvasElement>(canvasSelector).should((canvas) =>
      expect(time(canvas[0])).to.be.greaterThan(3),
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    );
    cy.contains('button', 'Glass seek').click();
    cy.get<HTMLCanvasElement>(canvasSelector).should((canvas) =>
      expect(time(canvas[0])).to.eq(0.5),
    );
  });
});

describe('LiquidGlassLogo documentation', () => {
  it('documents shared liquid-glass-logo scenes and framework navigation', () =>
    checkComponentDocs('liquid-glass-logo'));
});
