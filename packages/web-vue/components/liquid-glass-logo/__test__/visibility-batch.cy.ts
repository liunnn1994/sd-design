import LiquidGlassLogo from '../index';

describe('LiquidGlassLogo visibility batches', () => {
  it('advances the real WebGL clock for the newest visible record and stops for hidden', () => {
    let notify: IntersectionObserverCallback;
    cy.window().then((win) => {
      const Native = win.IntersectionObserver;
      cy.stub(win, 'IntersectionObserver').callsFake(
        (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
          notify = callback;
          return new Native(
            (entries, observer) =>
              callback(
                [{ isIntersecting: false } as IntersectionObserverEntry, ...entries],
                observer,
              ),
            options,
          );
        },
      );
    });
    cy.mount(LiquidGlassLogo, { props: { ending: 'logo', speed: 0.25, maxDpr: 1 } });
    cy.get('.sd-liquid-glass-logo').should('have.attr', 'data-liquid-glass-ready');
    cy.get('.sd-liquid-glass-logo canvas').then((canvas) => {
      const gl = (canvas[0] as HTMLCanvasElement).getContext('webgl2')!;
      const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
      const time = gl.getUniformLocation(program, 'uTime');
      cy.wrap(null).should(() =>
        expect(Number(gl.getUniform(program, time))).to.be.greaterThan(0.25),
      );
      cy.then(() =>
        notify(
          [{ isIntersecting: true }, { isIntersecting: false }] as IntersectionObserverEntry[],
          {} as IntersectionObserver,
        ),
      );
      const frames = () =>
        cy
          .window()
          .then(
            (win) =>
              new Promise<void>((resolve) =>
                win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve())),
              ),
          );
      let frozen = 0;
      frames().then(() => {
        frozen = Number(gl.getUniform(program, time));
      });
      frames().then(() => expect(Number(gl.getUniform(program, time))).to.equal(frozen));
    });
  });
});
