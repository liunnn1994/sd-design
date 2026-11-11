export {};
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const visit = (query = '', holdFrames = false) =>
  cy.visit(`/markdown-fade.html${query}`, {
    onBeforeLoad(window) {
      const animations: Array<{ duration: string; timing: string }> = [];
      Object.assign(window, { markdownFadeAnimations: animations });
      window.document.addEventListener('animationstart', (event) => {
        const element = event.target as Element;
        if (!element.matches('.text-node-stream-delta')) return;
        const style = window.getComputedStyle(element);
        animations.push({
          duration: style.animationDuration,
          timing: style.animationTimingFunction,
        });
      });
      if (!holdFrames) return;
      let id = 0;
      const frames = new Map<number, FrameRequestCallback>();
      window.requestAnimationFrame = (callback) => {
        frames.set(++id, callback);
        return id;
      };
      window.cancelAnimationFrame = (key) => {
        frames.delete(key);
      };
      Object.assign(window, {
        advanceMarkdownFadeFrame: () => {
          const current = [...frames.values()];
          frames.clear();
          current.forEach((callback) => callback(window.performance.now()));
        },
      });
    },
  });
const advance = () =>
  cy.window().then((window) => {
    const frame = (window as unknown as { advanceMarkdownFadeFrame(): void })
      .advanceMarkdownFadeFrame;
    frame();
    frame();
  });
describe('React Markdown node enter and text delta fades', () => {
  it('fades the actual content root on non-final appearance without adding a wrapper', () => {
    visit('', true);
    cy.get('.node-content > p')
      .should('have.class', 'fade-enter-from')
      .and('have.css', 'opacity', '0');
    cy.get('.node-content > p')
      .should('have.class', 'fade-enter-active')
      .and('have.css', 'transition-property', 'opacity');
    advance();
    cy.get('.node-content > p').should('have.class', 'fade-enter-to');
    cy.get('.fade-enter-active').should('not.exist');
    cy.get('.node-content > p').should('have.css', 'opacity', '1');
    control('Append block');
    cy.get('.node-slot').should('have.length', 2);
    cy.get('.node-slot').first().find('.fade-enter-active').should('not.exist');
    cy.get('.node-slot').last().find('p').should('have.class', 'fade-enter-from');
    advance();
    cy.get('.fade-enter-active').should('not.exist');
  });
  for (const query of ['?final', '?disabled', '?fragment', '?code']) {
    it(`does not apply the ordinary appearance transition for ${query}`, () => {
      visit(query);
      cy.get('[data-testid="fade-host"]').should(
        'contain.text',
        query === '?code' ? 'Code' : 'First',
      );
      cy.get('.fade-enter-active, .fade-enter-from, .fade-enter-to').should('not.exist');
      if (query === '?final') {
        control('Append block');
        cy.get('.node-slot').should('have.length', 2);
        cy.get('.fade-enter-active').should('not.exist');
      }
    });
  }
  it('does not replay existing content when fade is enabled, but fades subsequently mounted blocks', () => {
    visit('?disabled', true);
    cy.get('.node-content > p').should('have.text', 'First');
    control('Toggle fade');
    cy.get('.fade-enter-active').should('not.exist');
    control('Append block');
    cy.get('.node-slot').last().find('p').should('have.class', 'fade-enter-from');
    control('Toggle renderer');
    cy.get('.fade-enter-active').should('not.exist');
    advance();
    control('Toggle renderer');
    cy.get('.node-content > p.fade-enter-active').should('have.length', 2);
    advance();
    cy.get('.fade-enter-active').should('not.exist');
  });
  it('transitions a replaced custom component even when its parent is final', () => {
    visit('?custom&final', true);
    cy.get('[data-widget="initial"]').should('exist').and('not.have.class', 'fade-enter-active');
    control('Replace component');
    cy.get('[data-widget="replacement"]').should('have.class', 'fade-enter-from');
    advance();
    cy.get('[data-widget="replacement"]').should('have.class', 'fade-enter-to');
    cy.get('.fade-enter-active').should('not.exist');
  });
  it('lets an already running enter finish when fade is disabled', () => {
    visit('', true);
    cy.get('.node-content > p').should('have.class', 'fade-enter-active');
    control('Toggle fade');
    cy.get('.node-content > p').should('have.class', 'fade-enter-active');
    advance();
    cy.get('.node-content > p').should('have.class', 'fade-enter-to');
    cy.get('.fade-enter-active').should('not.exist');
  });
  it('animates only the appended text delta and preserves settled content during ordinary updates', () => {
    visit('?final');
    cy.get('.node-content p').should('have.text', 'First');
    control('Append text');
    cy.get('.text-node-stream-delta').should('have.text', ' delta');
    cy.get('.text-node-stream-delta').should('not.exist');
    cy.get('.node-content p').should('have.text', 'First delta');
    cy.get('.fade-enter-active').should('not.exist');
    control('Replace text');
    cy.get('.node-content p').should('have.text', 'Replacement');
    cy.get('.text-node-stream-delta, .fade-enter-active').should('not.exist');
  });
  it('appends text immediately with fade disabled', () => {
    visit('?disabled');
    cy.get('.node-content p').should('have.text', 'First');
    control('Append text');
    cy.get('.node-content p').should('have.text', 'First delta');
    cy.get('.text-node-stream-delta, .fade-enter-active').should('not.exist');
  });
  it('queues appends and retains finished delta DOM while that delta is selected', () => {
    visit('?final');
    control('Append text');
    let selected: Node;
    cy.get('.text-node-stream-delta').then(($delta) => {
      const delta = $delta[0];
      delta.style.animationDuration = '10s';
      selected = delta.firstChild!;
      const document = delta.ownerDocument;
      const range = document.createRange();
      range.selectNodeContents(delta);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
      delta.dispatchEvent(new AnimationEvent('animationend', { bubbles: true }));
    });
    cy.contains('button', /^Append text$/).then(($button) => $button[0].click());
    // Let React commit the native click before asserting that selection held the update.
    cy.wait(100);
    cy.get('.text-node').should('have.text', 'First delta');
    cy.then(() => expect(selected.isConnected).to.equal(true));
    cy.document().then((document) => {
      document.getSelection()!.removeAllRanges();
      document.dispatchEvent(new Event('selectionchange'));
    });
    cy.get('.text-node').should('have.text', 'First delta delta');
  });
  it('keeps an existing delta running when another block is appended', () => {
    visit('?final');
    control('Append text');
    let delta: HTMLElement;
    cy.get('.text-node-stream-delta').then(($delta) => {
      delta = $delta[0];
      delta.style.animationDuration = '10s';
    });
    control('Append block');
    cy.wait(100);
    cy.get('.text-node-stream-delta').should(($delta) => {
      expect($delta[0]).to.equal(delta);
      expect($delta).to.have.text(' delta');
    });
  });
  it('preserves a settled text selection while appending and finishing a delta', () => {
    visit('?final');
    let selected: Node;
    cy.get('.text-node').then(($text) => {
      selected = $text[0].firstChild!.firstChild!;
      const document = selected.ownerDocument!;
      const range = document.createRange();
      range.selectNodeContents(selected);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
    });
    cy.contains('button', /^Append text$/).then(($button) => $button[0].click());
    cy.get('.text-node').should('have.text', 'First delta');
    cy.get('.text-node-stream-delta').should('not.exist');
    cy.then(() => {
      expect(selected.isConnected).to.equal(true);
      expect(selected.ownerDocument!.getSelection()!.toString()).to.equal('First');
    });
  });
  it('keeps selected settled append nodes and compacts them after selection is released', () => {
    visit('?final');
    const appendAndFinish = () => {
      cy.contains('button', /^Append text$/).then(($button) => $button[0].click());
      cy.get('.text-node-stream-delta').then(($delta) =>
        $delta[0].dispatchEvent(new AnimationEvent('animationend', { bubbles: true })),
      );
      cy.get('.text-node-stream-delta').should('not.exist');
    };
    appendAndFinish();
    let selected: Node;
    cy.get('.text-node').then(($text) => {
      const extra = $text[0].children[1];
      selected = extra.firstChild!;
      const document = extra.ownerDocument;
      const range = document.createRange();
      range.selectNodeContents(selected);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
    });
    for (let index = 0; index < 5; index++) appendAndFinish();
    cy.get('.text-node').should(($text) => {
      expect($text[0].children[1].childNodes.length).to.equal(6);
      expect(selected.isConnected).to.equal(true);
      expect(selected.ownerDocument!.getSelection()!.toString()).to.equal(' delta');
    });
    cy.document().then((document) => document.getSelection()!.removeAllRanges());
    appendAndFinish();
    cy.get('.text-node').should(($text) => {
      expect($text[0].children[1].childNodes.length).to.equal(1);
      expect($text).to.have.text(`First${' delta'.repeat(7)}`);
    });
  });
  it('uses the pinned default text delta duration and easing', () => {
    visit('?final&defaults');
    cy.get('.node-content p').should('have.text', 'First');
    control('Append text');
    cy.window().should((window) =>
      expect(
        (
          window as unknown as {
            markdownFadeAnimations: Array<{ duration: string; timing: string }>;
          }
        ).markdownFadeAnimations,
      ).to.deep.include({ duration: '0.2s', timing: 'cubic-bezier(0.2, 0, 0.4, 1)' }),
    );
  });
});
