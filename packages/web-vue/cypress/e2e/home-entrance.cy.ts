describe('首页首屏入场', () => {
  it('水合前已有虚线，标题、框架行和输入框同步进入', () => {
    let initialOutline = false;
    let synchronized = false;
    cy.intercept('**/HomeAIWorkbench*.js*', (request) => {
      request.on('response', (response) => response.setDelay(1800));
    });
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined });
        const deadline = win.performance.now() + 10000;
        const sample = () => {
          const root = win.document.querySelector<HTMLElement>(
            '.home-workbench .sd-skeleton-reveal',
          );
          if (root?.dataset.state === 'idle' && root.querySelector('[data-reveal-initial] rect')) {
            initialOutline = root.getBoundingClientRect().height > 0;
            const elements = [
              win.document.querySelector('#home-title'),
              win.document.querySelector('.home-framework')?.closest('[data-home-enter]'),
              win.document.querySelector('.home-hero__workbench'),
            ];
            const starts = elements.map((element) => element?.getAnimations()[0]?.startTime);
            synchronized =
              elements.every(
                (element) =>
                  element && win.getComputedStyle(element).animationName === 'home-enter',
              ) &&
              starts.every((start) => typeof start === 'number') &&
              Math.max(...(starts as number[])) - Math.min(...(starts as number[])) < 50;
            if (synchronized) return;
          }
          if (win.performance.now() < deadline) win.requestAnimationFrame(sample);
        };
        win.requestAnimationFrame(sample);
      },
    });
    cy.wrap(null).should(() => {
      expect(initialOutline, 'outline exists before Vue hydration').to.equal(true);
      expect(synchronized, 'hero animations start together').to.equal(true);
    });
    cy.get('.home-workbench [data-state]', { timeout: 60000 }).should(
      'have.attr',
      'data-state',
      'complete',
    );
    cy.get('.home-workbench [data-reveal-initial]').should('not.exist');
    cy.get('.home-workbench__suggestions').should('not.exist');
    cy.contains('.home-workbench [contenteditable="true"] a', 'android-chrome-192x192.png').focus();
    cy.get('.home-file-links__preview img').should(($image) => {
      expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
      expect($image.attr('src')).to.equal('/android-chrome-192x192.png');
    });
  });
});
