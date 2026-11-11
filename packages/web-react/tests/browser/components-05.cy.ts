describe('React Switch', () => {
  beforeEach(() => cy.visit('/'));

  it('keeps public menu ref fields current across selection and root replacement', () => {
    const read = (expected: Record<string, unknown>) => {
      cy.contains('button', 'Read menu refs').click();
      cy.get('[data-testid="menu-ref-status"]')
        .invoke('text')
        .then((value) => {
          expect(JSON.parse(value)).to.include(expected);
        });
    };
    read({
      itemConnected: true,
      itemMatches: true,
      selected: false,
      level: 1,
      click: 'function',
      subConnected: true,
      subKey: 'first',
      childSelected: true,
      title: 'Menu First',
      nativeAttribute: 'menu-ref-sub',
      popup: false,
      modeConnected: true,
    });
    cy.get('[data-testid="menu-ref-status"]')
      .invoke('text')
      .then((value) => {
        expect(JSON.parse(value).itemKeys).to.include('nested');
        expect(JSON.parse(value).subKeys).to.deep.equal([]);
      });
    cy.contains('button', 'Click menu ref').click();
    cy.get('[data-testid="menu-item-events"]').should('have.text', '1');
    cy.contains('button', 'Activate menu ref').click();
    cy.get('[data-testid="menu-item-events"]').should('have.text', '2');
    read({ selected: true, childSelected: false });
    cy.get('[data-testid="menu-ref-status"]')
      .invoke('text')
      .then((value) => {
        expect(JSON.parse(value).contextSelected).to.deep.equal(['home']);
      });
    cy.get('[data-testid="menu-basic"] .sd-menu-collapse-button').click();
    read({ itemConnected: true, itemMatches: true, selected: true, subConnected: true });
    cy.contains('button', 'Toggle menu mode').click();
    read({ popup: true, modeConnected: true });
    cy.contains('button', 'Toggle menu mode').click();
    read({ popup: false, modeConnected: true });
  });

  it('adds Tabs after rendering, auto-selects the new pane and closes inactive panes without selecting them', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.get('[data-testid="tabs-edit"] .sd-tabs-nav-add-btn').click();
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e3').should(
      'have.attr',
      'aria-selected',
      'true',
    );
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e2')
      .find('button')
      .should('not.exist');
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e1')
      .find('.sd-tabs-tab-close-btn')
      .click();
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e1').should('not.exist');
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e3').should(
      'have.attr',
      'aria-selected',
      'true',
    );
    cy.get('[data-testid="tabs-events"]').should('have.text', 'delete:e1');
  });

  it('freezes hidden Tabs parent content while preserving local state and refreshes it on activation', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.contains('button', 'Update hidden Tabs content').click();
    cy.get('[data-testid="tabs-cache-a"]').should('contain.text', 'a:1:0');
    cy.get('[data-testid="tabs-cache-b"]').should('contain.text', 'b:0:0');
    cy.contains('[data-testid="tabs-cache"] [role="tab"]', 'Cache B').click();
    cy.get('[data-testid="tabs-cache-b"]').should('contain.text', 'b:1:0');
    cy.contains('button', 'Count b').click();
    cy.contains('[data-testid="tabs-cache"] [role="tab"]', 'Cache A').click();
    cy.contains('button', 'Update hidden Tabs content').click();
    cy.get('[data-testid="tabs-cache-b"]').should('contain.text', 'b:1:1');
    cy.contains('[data-testid="tabs-cache"] [role="tab"]', 'Cache B').click();
    cy.get('[data-testid="tabs-cache-b"]').should('contain.text', 'b:2:1');
  });

  it('lazily mounts Tabs panels and destroys content only after a pane has been hidden', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.get('input[aria-label="Lazy input B"]').should('not.exist');
    cy.get('input[aria-label="Lazy input A"]').type('saved');
    cy.contains('[data-testid="tabs-lazy"] [role="tab"]', 'Lazy B').click();
    cy.get('input[aria-label="Lazy input A"]').should('not.exist');
    cy.get('input[aria-label="Lazy input B"]').should('be.visible');
    cy.contains('[data-testid="tabs-lazy"] [role="tab"]', 'Lazy A').click();
    cy.get('input[aria-label="Lazy input A"]').should('have.value', '');
    cy.get('[data-testid="tabs-lazy"] [role="tabpanel"][aria-hidden="true"]').should(
      'have.attr',
      'inert',
    );
  });

  it('collects wrapped TabPane components in DOM order and isolates nested tabs', () => {
    cy.contains('button', 'Mount Tabs').click();
    const headers = '[data-testid="tabs-wrapped"] > .sd-tabs-nav [role="tab"]';
    cy.get(headers).should('have.length', 2).first().should('contain.text', 'Wrapped w1');
    cy.contains('button', 'Reverse wrapped Tabs').click();
    cy.get(headers).first().should('contain.text', 'Wrapped w2');
    cy.contains('button', 'Toggle wrapped Tabs').click();
    cy.get(headers).should('have.length', 3).last().should('contain.text', 'Wrapped w3');
    cy.contains(headers, 'Wrapped w3').click().should('have.attr', 'aria-selected', 'true');
    cy.contains('button', 'Toggle wrapped Tabs').click();
    cy.get(headers).should('have.length', 2);
  });

  it('scrolls overflowing Tabs by keyboard and wheel and resets navigation when resized', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-button').should('have.length', 2);
    cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-button-left').should('be.disabled');
    cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-button-right').click();
    cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-button-left').should('not.be.disabled');
    cy.get('[data-testid="tabs-overflow"] [role="tab"]').first().focus().type('{end}');
    const aligned = () =>
      cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-tab').should(($wrapper) => {
        const active = $wrapper[0].querySelector('[aria-selected="true"]')!;
        const rect = active.getBoundingClientRect(),
          bounds = $wrapper[0].getBoundingClientRect();
        expect(rect.left).to.be.at.least(bounds.left - 1);
        expect(rect.right).to.be.at.most(bounds.right + 1);
      });
    aligned();
    cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-tab-list')
      .invoke('css', 'transform')
      .then((before) => {
        cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-tab').trigger('wheel', {
          eventConstructor: 'WheelEvent',
          deltaY: -100,
          bubbles: true,
          cancelable: true,
        });
        cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-tab-list').should(
          'not.have.css',
          'transform',
          before,
        );
      });
    cy.contains('button', 'Resize Tabs navigation').click();
    cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-button').should('not.exist');
    cy.contains('button', 'Resize Tabs navigation').click();
    cy.contains('button', 'Toggle Tabs RTL').click();
    cy.get('[data-testid="tabs-overflow"] [role="tab"]').last().focus().type('{home}{end}');
    aligned();
    cy.contains('button', 'Toggle vertical Tabs').click();
    cy.get('[data-testid="tabs-overflow"] [role="tablist"]').should(
      'have.attr',
      'aria-orientation',
      'vertical',
    );
    cy.get('[data-testid="tabs-overflow"] [role="tab"]').last().focus().type('{home}{downarrow}');
    cy.focused().should('contain.text', 'Overflow tab 1');
  });

  it('measures capsule ink, supports every Tabs type and position and switches full-height scrollbars', () => {
    cy.contains('button', 'Mount Tabs').click();
    const aligned = () =>
      cy.get('[data-testid="tabs-style"] .sd-tabs-nav-ink-capsule').should(($ink) => {
        const active = $ink[0]
          .parentElement!.querySelector('[aria-selected="true"]')!
          .getBoundingClientRect();
        const ink = $ink[0].getBoundingClientRect();
        expect(ink.left).to.be.closeTo(active.left, 1);
        expect(ink.width).to.be.closeTo(active.width, 1);
        expect(ink.top).to.be.closeTo(active.top, 1);
        expect(ink.height).to.be.closeTo(active.height, 1);
      });
    aligned();
    cy.contains('[data-testid="tabs-style"] [role="tab"]', 'A substantially longer title').click();
    aligned();
    for (const position of ['left', 'right', 'bottom', 'top']) {
      cy.get('select[aria-label="Tabs position"]').select(position);
      cy.get('[data-testid="tabs-style"]').should('have.class', `sd-tabs-${position}`);
      aligned();
    }
    for (const type of ['line', 'card', 'card-gutter', 'text', 'rounded', 'capsule']) {
      cy.get('select[aria-label="Tabs type"]').select(type);
      cy.get('[data-testid="tabs-style"]').should('have.class', `sd-tabs-type-${type}`);
    }
    cy.get('[data-testid="tabs-style"] .sd-tabs-pane-scrollbar').should('exist');
    cy.contains('button', 'Toggle Tabs scrollbar').click();
    cy.get('[data-testid="tabs-style"] .sd-tabs-pane-scrollbar').should('not.exist');
  });

  it('repositions active Tabs for every scroll alignment and hides content without destroying it', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.get('[data-testid="tabs-overflow"] [role="tab"]')
      .first()
      .focus()
      .type('{rightarrow}{rightarrow}{rightarrow}{rightarrow}');
    for (const alignment of ['start', 'center', 'end', '24']) {
      cy.get('select[aria-label="Tabs alignment"]').select(alignment);
      cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-tab').should(($wrapper) => {
        const active = $wrapper[0].querySelector('[aria-selected="true"]')!;
        const rect = active.getBoundingClientRect(),
          bounds = $wrapper[0].getBoundingClientRect();
        const style = active.ownerDocument.defaultView!.getComputedStyle(active);
        const margin = parseFloat(alignment === 'end' ? style.marginRight : style.marginLeft) || 0;
        if (alignment === 'end') expect(rect.right).to.be.closeTo(bounds.right - margin, 1);
        else if (alignment === 'center')
          expect((rect.left + rect.right) / 2).to.be.closeTo(
            (bounds.left + bounds.right - margin) / 2,
            1,
          );
        else expect(rect.left).to.be.closeTo(bounds.left + (alignment === '24' ? 24 : margin), 1);
      });
    }
    cy.get('select[aria-label="Tabs type"]').select('line');
    cy.contains('button', 'Toggle Tabs header and content').click();
    cy.get('[data-testid="tabs-style"]').should('have.class', 'sd-tabs-justify');
    cy.get('[data-testid="tabs-style"] .sd-tabs-nav-tab-list').should(
      'have.class',
      'sd-tabs-nav-tab-list-no-padding',
    );
    cy.get('[data-testid="tabs-style"] .sd-tabs-content').should('not.be.visible');
    cy.contains('[data-testid="tabs-style"] .sd-tabs-pane', 'Long scrollable panel').should(
      'exist',
    );
    cy.get('[data-testid="tabs-overflow"] .sd-tabs-nav-tab').then(($el) => {
      cy.spy($el[0], 'removeEventListener').as('tabsWheelOff');
    });
    cy.contains('button', 'Unmount Tabs').click();
    cy.get('@tabsWheelOff').should('have.been.calledWith', 'wheel');
  });

  it('recreates the hidden Tabs content cache when its scrollbar wrapper is replaced', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.contains('button', 'Update hidden Tabs content').click();
    cy.get('[data-testid="tabs-cache-b"]').should('contain.text', 'b:0:0');
    cy.contains('button', 'Toggle cached Tabs scrolling').click();
    cy.get('[data-testid="tabs-cache"] .sd-tabs-pane-scrollbar').should('exist');
    cy.get('[data-testid="tabs-cache-b"]').should('contain.text', 'b:1:0');
    cy.contains('button', 'Update hidden Tabs content').click();
    cy.get('[data-testid="tabs-cache-b"]').should('contain.text', 'b:1:0');
    cy.contains('button', 'Toggle cached Tabs scrolling').click();
    cy.get('[data-testid="tabs-cache"] .sd-tabs-pane-scrollbar').should('not.exist');
    cy.get('[data-testid="tabs-cache-b"]').should('contain.text', 'b:2:0');
  });

  it('scrolls Anchor links and publishes select before change with the previous hash', () => {
    cy.contains('button', 'Mount Anchor').click();
    cy.get('[data-testid="anchor"] a[href="#anchor-a1"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.contains('button', 'Clear Anchor events').click();
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').click();
    cy.get('#anchor-sections-a').should(($el) => expect($el[0].scrollTop).to.be.closeTo(200, 1));
    cy.get('[data-testid="anchor-events"]').should(
      'have.text',
      'select:#anchor-a2:#anchor-a1|change:#anchor-a2',
    );
    cy.get('[data-testid="anchor"] .sd-anchor-line-slider').should(($line) => {
      const active = $line[0].parentElement!.querySelector('.sd-anchor-link-active') as HTMLElement;
      expect(parseFloat($line[0].style.top)).to.equal(active.offsetTop);
    });
    cy.location('hash').should('equal', '');
    cy.get('#anchor-sections-a').scrollTo(0, 0);
    cy.get('[data-testid="anchor"] a[href="#anchor-a1"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.contains('button', 'Toggle Anchor boundary').click();
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').click();
    cy.get('#anchor-sections-a').should(($el) => expect($el[0].scrollTop).to.be.closeTo(180, 1));
  });

  it('registers renamed Anchor links, removes stale links and resolves literal ids', () => {
    cy.contains('button', 'Mount Anchor').click();
    cy.get('[data-testid="anchor"] a[href="#anchor-a1"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.contains('button', 'Rename Anchor link').click();
    cy.get('#anchor-sections-a').scrollTo(0, 400);
    cy.get('[data-testid="anchor"] a[href="#anchor-a3"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.get('[data-testid="anchor"] a[href="#anchor:100%"]').click();
    cy.get('#anchor-sections-a').should(($el) => expect($el[0].scrollTop).to.be.closeTo(600, 1));
    cy.get('[data-testid="anchor"] a[href="#anchor:100%"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.contains('button', 'Toggle Anchor link').click();
    cy.get('[data-testid="anchor"] a[href="#anchor-a3"]').should('not.exist');
    cy.get('#anchor-sections-a').scrollTo(0, 400);
    cy.get('[data-testid="anchor"] a[href="#anchor:100%"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
  });

  it('switches Anchor containers, layout and Affix composition and detaches listeners', () => {
    cy.contains('button', 'Mount Anchor').click();
    cy.get('#anchor-sections-a').scrollTo(0, 200);
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.get('#anchor-sections-a').then(($el) => {
      cy.spy($el[0], 'removeEventListener').as('anchorOldOff');
    });
    cy.contains('button', 'Switch Anchor container').click();
    cy.get('@anchorOldOff').should('have.been.calledWith', 'scroll');
    cy.get('[data-testid="anchor"] a[href="#anchor-b1"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.get('#anchor-sections-b').scrollTo(0, 200);
    cy.get('[data-testid="anchor"] a[href="#anchor-b2"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.contains('button', 'Toggle Anchor direction').click();
    cy.get('[data-testid="anchor"] .sd-anchor').should('have.class', 'sd-anchor-horizontal');
    cy.get('[data-testid="anchor"] .sd-anchor-list > li > a').should(($links) => {
      expect($links[1].getBoundingClientRect().top).to.equal($links[0].getBoundingClientRect().top);
    });
    cy.contains('button', 'Toggle Anchor line').click();
    cy.get('[data-testid="anchor"] .sd-anchor-line-slider').should('not.exist');
    cy.contains('button', 'Toggle Anchor affix').click();
    cy.get('[data-testid="anchor"] .sd-affix').should('have.css', 'z-index', '999');
    cy.get('#anchor-sections-b').then(($el) => {
      cy.spy($el[0], 'removeEventListener').as('anchorOff');
    });
    cy.contains('button', 'Unmount Anchor').click();
    cy.get('@anchorOff').should('have.been.calledWith', 'scroll');
    cy.get('[data-testid="anchor"]').should('not.exist');
  });

  it('resumes Anchor tracking after smooth scrolling and cancels animation on unmount', () => {
    cy.contains('button', 'Mount Anchor').click();
    cy.contains('button', 'Toggle Anchor smooth').click();
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').click();
    cy.wait(350);
    cy.get('#anchor-sections-a').should(($el) => expect($el[0].scrollTop).to.be.closeTo(200, 1));
    cy.get('#anchor-sections-a').scrollTo(0, 0);
    cy.get('[data-testid="anchor"] a[href="#anchor-a1"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').then(($link) => {
      const target = $link[0].ownerDocument.querySelector('#anchor-sections-a')!;
      const descriptor = Object.getOwnPropertyDescriptor(
        target.ownerDocument.defaultView!.Element.prototype,
        'scrollTop',
      )!;
      const writes = cy.spy();
      Object.defineProperty(target, 'scrollTop', {
        configurable: true,
        get() {
          return descriptor.get!.call(this);
        },
        set(value) {
          writes(value);
          descriptor.set!.call(this, value);
        },
      });
      $link[0].click();
      expect(writes).to.have.been.called;
      Array.from($link[0].ownerDocument.querySelectorAll('button'))
        .find((button) => button.textContent === 'Unmount Anchor')
        ?.click();
      cy.get('[data-testid="anchor"]').should('not.exist');
      cy.then(() => {
        const count = writes.callCount;
        cy.wait(350).then(() => expect(writes.callCount).to.equal(count));
      });
    });
    cy.get('[data-testid="anchor"]').should('not.exist');
  });

  it('decodes the initial Anchor hash and preserves native hash navigation when enabled', () => {
    cy.visit('/#anchor%3A100%25');
    cy.contains('button', 'Mount Anchor').click();
    cy.get('[data-testid="anchor"] a[href="#anchor:100%"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
    cy.get('#anchor-sections-a').should(($el) => expect($el[0].scrollTop).to.be.closeTo(600, 1));
    cy.contains('button', 'Toggle Anchor hash').click();
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').click();
    cy.location('hash').should('equal', '#anchor-a2');
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').should(
      'have.attr',
      'aria-current',
      'location',
    );
  });

  it('tracks BackTop thresholds, supports keyboard activation and removes its leaving content', () => {
    cy.contains('button', 'Instant BackTop').click();
    cy.contains('button', 'Mount BackTop').click();
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.get('#back-top-first').scrollTo(0, 200);
    cy.get('[data-testid="back-top"] button')
      .should('have.attr', 'aria-label', 'Back to top')
      .focus()
      .should('be.focused');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: {
          type: 'keyDown',
          key: 'Enter',
          code: 'Enter',
          windowsVirtualKeyCode: 13,
          text: '\r',
        },
      }),
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
      }),
    );
    cy.get('#back-top-first').should(($el) => expect($el[0].scrollTop).to.equal(0));
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.get('[data-testid="back-top-clicks"]').should('have.text', '1');
    cy.get('#back-top-first').scrollTo(0, 300);
    cy.get('[data-testid="back-top"]').should('be.visible');
    cy.contains('button', 'Change BackTop threshold').click();
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.contains('button', 'Change BackTop threshold').click();
    cy.get('[data-testid="back-top"]').should('be.visible');
    cy.contains('button', 'Custom BackTop').click();
    cy.contains('button', 'Instant BackTop').click();
    cy.contains('button', 'Custom return').click();
    cy.get('#back-top-first').should(($el) => expect($el[0].scrollTop).to.equal(0));
    cy.get('[data-testid="back-top-clicks"]').should('have.text', '2');
  });

  it('rebinds BackTop targets and detaches listeners on unmount', () => {
    cy.contains('button', 'Mount BackTop').click();
    cy.get('#back-top-first')
      .scrollTo(0, 300)
      .then(($el) => {
        cy.spy($el[0], 'removeEventListener').as('backTopOldOff');
      });
    cy.get('[data-testid="back-top"]').should('be.visible');
    cy.contains('button', 'Switch BackTop target').click();
    cy.get('@backTopOldOff').should('have.been.calledWith', 'scroll');
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.get('#back-top-second')
      .scrollTo(0, 300)
      .then(($el) => {
        cy.spy($el[0], 'removeEventListener').as('backTopOff');
      });
    cy.get('[data-testid="back-top"]').should('be.visible');
    cy.contains('button', 'Unmount BackTop').click();
    cy.get('@backTopOff').should('have.been.calledWith', 'scroll');
    cy.get('[data-testid="back-top"]').should('not.exist');
  });

  it('returns immediately when BackTop inherits reduced-motion preference', () => {
    cy.window().then((win) => {
      const original = win.matchMedia.bind(win);
      cy.stub(win, 'matchMedia').callsFake((query) => {
        const media = original(query);
        if (query === '(prefers-reduced-motion: reduce)')
          Object.defineProperty(media, 'matches', { value: true });
        return media;
      });
    });
    cy.contains('button', 'Mount BackTop').click();
    cy.get('#back-top-first').scrollTo(0, 300);
    cy.get('[data-testid="back-top"] button')
      .should('be.visible')
      .then(($button) => {
        $button[0].click();
        expect($button[0].ownerDocument.querySelector('#back-top-first')?.scrollTop).to.equal(0);
      });
    cy.get('[data-testid="back-top"]').should('not.exist');
  });

  it('cancels BackTop scrolling when unmounted during an animation', () => {
    cy.contains('button', 'Mount BackTop').click();
    cy.get('#back-top-first').scrollTo(0, 300);
    cy.get('[data-testid="back-top"] button')
      .should('be.visible')
      .then(($button) => {
        $button[0].click();
        Array.from($button[0].ownerDocument.querySelectorAll('button'))
          .find((button) => button.textContent === 'Unmount BackTop')
          ?.click();
      });
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.get('#back-top-first').then(($target) => {
      const position = $target[0].scrollTop;
      expect(position).to.be.greaterThan(0);
      cy.wait(250).then(() => expect($target[0].scrollTop).to.equal(position));
    });
  });

  it('affixes to a real scroll target, preserves resized content space and follows outer scrolling', () => {
    cy.contains('button', '加载固钉夹具').click();
    cy.get('[data-testid="affix-wrapper"] .sd-affix').should('not.exist');
    cy.get('#affix-first').scrollTo(0, 120);
    const checkTop = (offset: number) =>
      cy.get('[data-testid="affix-wrapper"]').should(($wrapper) => {
        const target = $wrapper[0].ownerDocument.querySelector('#affix-first')!;
        const fixed = $wrapper[0].querySelector('.sd-affix')!;
        expect(fixed.getBoundingClientRect().top).to.be.closeTo(
          target.getBoundingClientRect().top + offset,
          1,
        );
        expect(fixed.getBoundingClientRect().width).to.be.closeTo(
          $wrapper[0].getBoundingClientRect().width,
          1,
        );
      });
    checkTop(10);
    cy.get('[data-testid="affix-events"]').should('have.text', 'true');
    cy.contains('button', '改变固钉偏移').click();
    checkTop(30);
    cy.get('#affix-outer').scrollTo(0, 50);
    checkTop(30);
    cy.contains('button', '改变固钉高度').click();
    cy.get('[data-testid="affix-wrapper"] .sd-affix').prev().should('have.css', 'height', '90px');
    cy.contains('button', '改变固钉宽度').click();
    cy.get('#affix-outer').should('have.css', 'width', '340px');
    checkTop(30);
    cy.get('[data-testid="affix-events"]').should('have.text', 'true');
    cy.get('#affix-first').scrollTo(0, 0);
    cy.get('[data-testid="affix-wrapper"] .sd-affix').should('not.exist');
    cy.get('[data-testid="affix-events"]').should('have.text', 'true,false');
  });

  it('uses bottom offsets in preference to top offsets and releases after scrolling into view', () => {
    cy.contains('button', '加载固钉夹具').click();
    cy.contains('button', '切换底部固钉').click();
    const checkBottom = () =>
      cy.get('[data-testid="affix-wrapper"]').should(($wrapper) => {
        const target = $wrapper[0].ownerDocument.querySelector('#affix-first')!;
        const fixed = $wrapper[0].querySelector('.sd-affix')!;
        expect(fixed.getBoundingClientRect().bottom).to.be.closeTo(
          target.getBoundingClientRect().bottom - 15,
          1,
        );
      });
    checkBottom();
    cy.contains('button', '改变固钉高度').click();
    cy.get('[data-testid="affix-wrapper"] .sd-affix').prev().should('have.css', 'height', '90px');
    checkBottom();
    cy.contains('button', '改变固钉高度').click();
    cy.get('[data-testid="affix-wrapper"] .sd-affix').prev().should('have.css', 'height', '40px');
    cy.get('#affix-first').scrollTo(0, 250);
    cy.get('[data-testid="affix-wrapper"] .sd-affix').should('not.exist');
  });

  it('rebinds Affix targets, refreshes position through its ref and cleans up listeners', () => {
    cy.contains('button', '加载固钉夹具').click();
    cy.get('#affix-first').scrollTo(0, 120);
    cy.get('#affix-first').then(($target) => {
      cy.spy($target[0], 'removeEventListener').as('oldAffixOff');
    });
    cy.contains('button', '切换固钉目标').click();
    cy.get('@oldAffixOff')
      .should('have.been.calledWith', 'scroll')
      .and('have.been.calledWith', 'resize');
    const checkTarget = () =>
      cy.get('[data-testid="affix-wrapper"]').should(($wrapper) => {
        const target = $wrapper[0].ownerDocument.querySelector('#affix-second')!;
        expect($wrapper[0].querySelector('.sd-affix')!.getBoundingClientRect().top).to.be.closeTo(
          target.getBoundingClientRect().top + 10,
          1,
        );
      });
    checkTarget();
    cy.get('#affix-second').invoke('css', 'transform', 'translateY(25px)');
    cy.contains('button', '刷新固钉位置').click();
    checkTarget();
    cy.get('#affix-second').then(($target) => {
      cy.spy($target[0], 'removeEventListener').as('targetAffixOff');
    });
    cy.get('#affix-outer').then(($target) => {
      cy.spy($target[0], 'removeEventListener').as('outerAffixOff');
    });
    cy.contains('button', '卸载固钉夹具').click();
    cy.get('@targetAffixOff')
      .should('have.been.calledWith', 'scroll')
      .and('have.been.calledWith', 'resize');
    cy.get('@outerAffixOff')
      .should('have.been.calledWith', 'scroll')
      .and('have.been.calledWith', 'resize');
    cy.get('[data-testid="affix-wrapper"]').should('not.exist');
    cy.get('[data-testid="affix-events"]').should('have.text', 'true');
  });

  it('scrolls the initially selected menu leaf after automatic expansion in StrictMode', () => {
    cy.contains('button', 'Mount selected menu').click();
    cy.contains(
      '[data-testid="menu-initial-scroll"] .sd-menu-inline-header',
      'Initial Branch',
    ).should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-testid="menu-initial-scroll"] .sd-menu-inner').should(($el) => {
      expect($el[0].scrollTop).to.be.greaterThan(0);
      const viewport = $el[0].getBoundingClientRect();
      const item = $el[0].querySelector('[aria-current="page"]')!.getBoundingClientRect();
      expect(item.top).to.be.at.least(viewport.top - 1);
      expect(item.bottom).to.be.at.most(viewport.bottom + 1);
    });
  });

  it('opens selected menu ancestors, changes accordion branches and activates items by keyboard', () => {
    cy.get('[data-testid="menu-basic"]').within(() => {
      cy.contains('.sd-menu-inline-header', 'Menu First').should(
        'have.attr',
        'aria-expanded',
        'true',
      );
      cy.contains('[role="menuitem"]', 'Menu Home')
        .focus()
        .type('{enter}')
        .should('have.attr', 'aria-current', 'page');
      cy.contains('[role="menuitem"]', 'Menu Disabled')
        .click()
        .should('not.have.attr', 'aria-current');
      cy.contains('.sd-menu-inline-header', 'Menu Second')
        .click()
        .should('have.attr', 'aria-expanded', 'true');
      cy.contains('.sd-menu-inline-header', 'Menu First').should(
        'have.attr',
        'aria-expanded',
        'false',
      );
      cy.contains('.sd-menu-item', 'Menu Other').should('be.visible').click();
      cy.contains('[role="menuitem"]', 'Menu Home').focus().type('{downarrow}');
      cy.focused().should('contain.text', 'Menu First');
    });
    cy.get('[data-testid="menu-item-events"]').should('have.text', '1');
    cy.get('[data-testid="menu-selection"]').should('have.text', 'other');
  });

  it('keeps controlled menu selection and expansion unchanged until writeback', () => {
    cy.contains('[data-testid="menu-controlled"] .sd-menu-item', 'Controlled Menu Item')
      .click()
      .should('not.have.attr', 'aria-current');
    cy.get('[data-testid="menu-requests"]').should('have.text', 'select:controlled-item');
    cy.contains('.sd-menu-inline-header', 'Controlled Menu Branch')
      .click()
      .should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="menu-requests"]').should('have.text', 'open:controlled');
    cy.contains('button', 'Allow menu writeback').click();
    cy.contains('[data-testid="menu-controlled"] .sd-menu-item', 'Controlled Menu Item').should(
      'have.attr',
      'aria-current',
      'page',
    );
    cy.contains('.sd-menu-inline-header', 'Controlled Menu Branch').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
  });

  it('selects nested popup menu items and closes every popup ancestor', () => {
    cy.contains('[data-testid="menu-popup"] .sd-menu-pop-header', 'Popup Menu Branch').click();
    cy.get('[data-testid="menu-selection"]').should('have.text', 'popup');
    cy.contains('.sd-trigger-menu-pop-header', 'Popup Menu Inner').should('be.visible').click();
    cy.contains('.sd-trigger-menu-item', 'Popup Menu Leaf')
      .should('be.visible')
      .focus()
      .type('{downarrow}');
    cy.focused().should('contain.text', 'Popup Menu Leaf').type('{enter}');
    cy.get('[data-testid="menu-selection"]').should('have.text', 'popup-leaf');
    cy.contains('.sd-trigger-menu-item', 'Popup Menu Leaf').should('not.be.visible');
    cy.contains('[data-testid="menu-popup"] .sd-menu-pop-header', 'Popup Menu Branch').should(
      'have.class',
      'sd-menu-selected',
    );
    cy.contains('button', 'Toggle menu mode').click();
    cy.get('[data-testid="menu-popup"]').should('have.class', 'sd-menu-pop');
  });

  it('moves horizontal overflow items into a popup and restores their original keys on resize', () => {
    cy.get('[data-testid="menu-horizontal"] [role="menubar"]').should('exist');
    cy.contains('[data-testid="menu-horizontal"] .sd-menu-item', 'Horizontal Alpha').should(
      'have.attr',
      'aria-current',
      'page',
    );
    cy.get('[data-testid="menu-horizontal"] .sd-menu-overflow-sub-menu')
      .should('be.visible')
      .click();
    cy.contains('.sd-trigger-menu-item', 'Horizontal Delta').should('be.visible').click();
    cy.get('[data-testid="menu-selection"]').should('have.text', 'horizontal-d');
    cy.contains('button', 'Resize horizontal menu').click();
    cy.get('[data-testid="menu-horizontal"] .sd-menu-overflow-sub-menu').should('not.exist');
    cy.contains('[data-testid="menu-horizontal"] .sd-menu-item', 'Horizontal Delta').should(
      'have.attr',
      'aria-current',
      'page',
    );
    cy.contains('[data-testid="menu-horizontal"] .sd-menu-item', 'Horizontal Alpha')
      .focus()
      .type('{rightarrow}');
    cy.focused().should('contain.text', 'Horizontal Beta');
    cy.focused().type('{home}');
    cy.focused().should('contain.text', 'Horizontal Alpha').type('{end}');
    cy.focused().should('contain.text', 'Horizontal Delta');
  });

  it('opens dynamically registered submenus and scrolls a selected item into view', () => {
    cy.contains('[data-testid="menu-dynamic"] .sd-menu-inline-header', 'Existing Branch').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
    cy.contains('button', 'Toggle late menu').click();
    cy.contains('[data-testid="menu-dynamic"] .sd-menu-inline-header', 'Late Branch').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
    cy.get('[data-testid="menu-scroll"] .sd-menu-inner').should(($el) => {
      expect($el[0].scrollTop).to.be.greaterThan(0);
      const viewport = $el[0].getBoundingClientRect();
      const item = $el[0].querySelector('[aria-current="page"]')!.getBoundingClientRect();
      expect(item.top).to.be.at.least(viewport.top - 1);
      expect(item.bottom).to.be.at.most(viewport.bottom + 1);
    });
    cy.contains('button', 'Toggle late menu').click();
    cy.contains('[data-testid="menu-dynamic"] .sd-menu-inline-header', 'Late Branch').should(
      'not.exist',
    );
  });

  it('resets popup visibility when a submenu changes between inline and popup modes', () => {
    cy.contains('[data-testid="menu-popup"] .sd-menu-inline-header', 'Mode Menu Branch').click();
    cy.contains('[data-testid="menu-popup"] .sd-menu-item', 'Mode Menu Leaf').should('be.visible');
    cy.contains('button', 'Toggle menu mode').click();
    cy.contains('[data-testid="menu-popup"] .sd-menu-pop-header', 'Mode Menu Branch').click();
    cy.contains('.sd-trigger-menu-item', 'Mode Menu Leaf').should('be.visible');
    cy.contains('button', 'Toggle menu mode').click();
    cy.contains('button', 'Toggle menu mode').click();
    cy.contains('[data-testid="menu-popup"] .sd-menu-pop-header', 'Mode Menu Branch').should(
      'have.attr',
      'aria-expanded',
      'false',
    );
    cy.contains('.sd-trigger-menu-item', 'Mode Menu Leaf').should('not.be.visible');
  });

  it('inherits sider rail width and theme and responds to breakpoints and collapse buttons', () => {
    cy.get('[data-testid="menu-sider"]')
      .should('have.class', 'sd-menu-dark')
      .and('have.class', 'sd-menu-collapsed')
      .and('have.css', 'width', '80px');
    cy.contains('button', 'Toggle menu rail').click();
    cy.get('[data-testid="menu-sider"]')
      .should('not.have.class', 'sd-menu-collapsed')
      .and('have.css', 'width', '260px');
    cy.get('[data-testid="menu-basic"] .sd-menu-collapse-button').click();
    cy.get('[data-testid="menu-basic"]').should('have.class', 'sd-menu-collapsed');
    cy.viewport(600, 800);
    cy.get('[data-testid="menu-responsive"]').should('have.class', 'sd-menu-collapsed');
    cy.get('[data-testid="menu-requests"]').should('have.text', 'responsive:true');
    cy.viewport(1000, 800);
    cy.get('[data-testid="menu-responsive"]').should('not.have.class', 'sd-menu-collapsed');
  });

  it('refreshes menu ancestors for dynamic grandchildren and isolates nested roots', () => {
    const root = '[data-collector="root"]';
    const tree = (key: string, children: unknown[]) =>
      JSON.stringify([{ key, children: [{ key: 'nested', children }] }]);
    cy.get(root).should('have.text', tree('branch', [{ key: 'leaf' }]));
    cy.get('[data-collector="isolated"]').should('have.text', '[{"key":"independent"}]');
    cy.contains('button', 'Toggle collected leaf').click();
    cy.get(root).should('have.text', tree('branch', []));
    cy.contains('button', 'Toggle collected leaf').click();
    cy.get(root).should('have.text', tree('branch', [{ key: 'leaf' }]));
    cy.contains('button', 'Rename collected branch').click();
    cy.get(root).should('have.text', tree('renamed', [{ key: 'leaf' }]));
  });

  it('removes and remounts popup menu collectors without duplicate registration', () => {
    const root = '[data-collector="root"]';
    cy.contains('button', 'Toggle collected branch').click();
    cy.get(root).should('have.text', '[]');
    cy.contains('button', 'Toggle collected branch').click();
    cy.get(root).should(
      'have.text',
      '[{"key":"branch","children":[{"key":"nested","children":[{"key":"leaf"}]}]}]',
    );
    cy.contains('button', 'Toggle collected branch').click();
    cy.get(root).should('have.text', '[]');
  });

  it('reports submenus added after popup registration to the root', () => {
    cy.contains('button', 'Toggle late submenu').click();
    cy.get('[data-collector="root"]').should(
      'have.text',
      '[{"key":"branch","children":[{"key":"nested","children":[{"key":"leaf"}]},{"key":"late","children":[{"key":"late-leaf"}]}]}]',
    );
    cy.contains('button', 'Toggle late submenu').click();
    cy.get('[data-collector="root"]').should(
      'have.text',
      '[{"key":"branch","children":[{"key":"nested","children":[{"key":"leaf"}]}]}]',
    );
  });

  it('switches accordion panels by keyboard and destroys content after leaving', () => {
    cy.contains('[role="button"]', '面板一').should('have.attr', 'aria-expanded', 'true');
    cy.get('[aria-label="面板一输入"]').should('be.visible');
    cy.get('[aria-label="面板二输入"]').should('not.exist');
    cy.contains('[role="button"]', '面板二').focus().type('{enter}');
    cy.get('[aria-label="面板二输入"]').should('be.visible');
    cy.get('[aria-label="面板一输入"]').should('not.exist');
    cy.contains('[role="button"]', '面板二')
      .invoke('attr', 'aria-controls')
      .then((id) => cy.get(`[id="${id}"]`).should('have.attr', 'role', 'region'));
    cy.get('[data-testid="accordion"] i').should('have.text', '局部开');
    cy.get('[data-testid="accordion"]').should('have.class', 'sd-collapse-borderless');
    cy.contains('[role="button"]', '禁用面板')
      .click()
      .should('have.attr', 'aria-expanded', 'false');
  });

  it('retains collapse content when destruction changes or a leave animation is cancelled', () => {
    cy.get('[aria-label="面板一输入"]').type('保留内容');
    cy.contains('[role="button"]', '面板一').then(($header) =>
      cy.window().then(
        (win) =>
          new Cypress.Promise<void>((resolve) => {
            $header[0].click();
            win.requestAnimationFrame(() => {
              expect($header.attr('aria-expanded')).to.eq('false');
              $header[0].click();
              resolve();
            });
          }),
      ),
    );
    cy.get('[aria-label="面板一输入"]').should('be.visible').and('have.value', '保留内容');
    cy.contains('button', '切换折叠销毁').click();
    cy.contains('[role="button"]', '面板一').click();
    cy.get('[aria-label="面板一输入"]').should('exist').and('not.be.visible');
    cy.get('[aria-label="面板二输入"]').should('exist');
    cy.contains('button', '切换折叠销毁').click();
    cy.get('[aria-label="面板一输入"]').should('not.exist');
    cy.contains('button', '切换折叠图标').click();
    cy.get('[data-testid="accordion"] .sd-collapse-item-icon-hover').should('not.exist');
  });

  it('keeps controlled numeric keys and does not intercept editable header keys or extra actions', () => {
    cy.contains('[role="button"]', '数字零面板')
      .click()
      .should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="collapse-requests"]').should('have.text', '1');
    cy.contains('button', '独立操作').click();
    cy.get('[data-testid="collapse-requests"]').should('have.text', '1');
    cy.contains('button', '外部展开面板').click();
    cy.contains('[role="button"]', '数字零面板').should('have.attr', 'aria-expanded', 'true');
    cy.get('[aria-label="标题输入"]').focus().type('a b').should('have.value', 'a b');
    cy.get('[data-testid="editable-collapse"] [role="button"]').should(
      'have.attr',
      'aria-expanded',
      'false',
    );
  });

  it('updates timeline terminal lines and visual ordering when reversed and reordered', () => {
    cy.get('[data-testid="timeline"] > .sd-timeline-item')
      .should('have.length', 4)
      .last()
      .should('have.class', 'sd-timeline-item-last');
    cy.contains('button', '倒序时间轴').click();
    cy.get('[data-testid="timeline-A"]').should('have.class', 'sd-timeline-item-last');
    cy.get('[data-testid="timeline"]').should('have.css', 'flex-direction', 'column-reverse');
    cy.get('[data-testid="timeline"] > .sd-timeline-item').then(($items) =>
      expect($items[3].getBoundingClientRect().top).to.be.lessThan(
        $items[0].getBoundingClientRect().top,
      ),
    );
    cy.contains('button', '重排时间轴').click();
    cy.get('[data-testid="timeline-C"]')
      .should('have.class', 'sd-timeline-item-last')
      .and('have.class', 'sd-timeline-item-vertical-left');
    cy.get('[data-testid="timeline-A"]')
      .should('not.have.class', 'sd-timeline-item-last')
      .and('have.class', 'sd-timeline-item-vertical-right');
    cy.get('[data-testid="timeline-B"]').should('not.exist');
  });

  it('merges pending spin settings and handles custom pending content and its removal', () => {
    cy.get('[data-testid="timeline"] .sd-dot-loading').should('exist');
    cy.get('[data-testid="timeline"] .sd-spin-tip').should('have.text', '局部等待');
    cy.contains('button', '切换待办节点').click();
    cy.get('[data-testid="timeline"] > .sd-timeline-item')
      .should('have.length', 3)
      .last()
      .should('have.class', 'sd-timeline-item-last');
    cy.contains('button', '切换待办内容').click();
    cy.get('[data-testid="timeline"] > .sd-timeline-item').should('have.length', 4);
    cy.get('[data-testid="timeline"] .sd-timeline-item-dot-custom').should('have.text', '待办图标');
    cy.get('[data-testid="timeline"]').should('contain.text', '自定义待办');
    cy.contains('button', '切换待办内容').click();
    cy.get('[data-testid="timeline"] > .sd-timeline-item').should('have.length', 3);
  });

  it('applies timeline positions, labels, dot styles and horizontal line styles', () => {
    cy.get('[data-testid="timeline-A"] .sd-timeline-item-dot').should(
      'have.css',
      'border-color',
      'rgb(10, 180, 42)',
    );
    cy.get('[data-testid="timeline-A"] > .sd-timeline-item-label').should('have.text', '时间 A');
    cy.get('[data-testid="timeline-A"] .sd-timeline-item-dot-line').should(
      'have.css',
      'border-left-style',
      'dotted',
    );
    cy.contains('button', '切换时间轴方向').click();
    cy.get('[data-testid="timeline-A"]').should('have.class', 'sd-timeline-item-horizontal-top');
    cy.get('[data-testid="timeline-B"]').should('have.class', 'sd-timeline-item-horizontal-bottom');
    cy.get('[data-testid="timeline-A"] .sd-timeline-item-dot-line')
      .should('have.css', 'border-top-style', 'dotted')
      .and('have.css', 'border-color', 'rgb(200, 20, 30)');
    cy.get('[data-testid="override-timeline"] > .sd-timeline-item')
      .first()
      .should('have.class', 'sd-timeline-item-horizontal-bottom');
    cy.get('[data-testid="override-timeline"] > .sd-timeline-item')
      .last()
      .should('have.class', 'sd-timeline-item-horizontal-top');
  });

  it('keeps controlled steps unchanged until writeback and ignores disabled activation', () => {
    cy.contains('[role="listitem"]', '受控第一步').should('have.attr', 'aria-current', 'step');
    cy.contains('[role="listitem"]', '受控第二步').focus().type('{enter}');
    cy.get('[data-testid="step-requests"]').should('have.text', '1');
    cy.contains('[role="listitem"]', '受控第一步').should('have.attr', 'aria-current', 'step');
    cy.contains('[role="listitem"]', '禁用步骤')
      .should('have.attr', 'aria-disabled', 'true')
      .should('not.have.attr', 'tabindex');
    cy.contains('[role="listitem"]', '禁用步骤').click();
    cy.get('[data-testid="step-requests"]').should('have.text', '1');
    cy.contains('button', '外部切换步骤').click();
    cy.contains('[role="listitem"]', '受控第二步').should('have.attr', 'aria-current', 'step');
  });

  it('updates step indexes and error connections after reorder, removal and nested registration', () => {
    cy.get('[data-testid="dynamic-steps"] > div > .sd-steps-item')
      .eq(0)
      .should('have.class', 'sd-steps-item-next-error');
    cy.contains('button', '切换步骤错误').click();
    cy.get('[data-testid="dynamic-steps"] > div > .sd-steps-item')
      .eq(0)
      .should('not.have.class', 'sd-steps-item-next-error');
    cy.contains('button', '切换步骤错误').click();
    cy.contains('button', '重排步骤').click();
    cy.get('[data-testid="dynamic-steps"] > div > .sd-steps-item').should('have.length', 3);
    cy.get('[data-testid="dynamic-steps"] > div')
      .first()
      .find('.sd-steps-item')
      .first()
      .should('contain.text', 'C')
      .should('not.have.class', 'sd-steps-item-next-error')
      .click();
    cy.get('[data-testid="dynamic-steps"] > div')
      .first()
      .find('.sd-steps-item')
      .first()
      .should('have.attr', 'aria-current', 'step');
    cy.get('[data-testid="nested-steps"] .sd-steps-icon').should('have.text', '1');
  });

  it('applies steps direction rules and custom node renderers', () => {
    cy.get('[data-testid="dynamic-steps"]')
      .should('have.class', 'sd-steps-vertical')
      .and('have.class', 'sd-steps-size-small');
    cy.contains('button', '切换步骤类型').click();
    cy.get('[data-testid="dynamic-steps"]')
      .should('have.class', 'sd-steps-mode-dot')
      .and('have.class', 'sd-steps-label-horizontal')
      .and('not.have.class', 'sd-steps-size-small');
    cy.contains('button', '切换步骤连接线').click();
    cy.get('[data-testid="dynamic-steps"] > div')
      .first()
      .find('.sd-steps-item-tail')
      .should('not.exist');
    cy.contains('button', '切换步骤类型').click();
    cy.get('[data-testid="dynamic-steps"]')
      .should('have.class', 'sd-steps-horizontal')
      .and('have.class', 'sd-steps-mode-arrow');
    cy.get('[data-testid="dynamic-steps"] > div')
      .first()
      .find('.sd-steps-item-node')
      .should('not.exist');
    cy.contains('button', '切换步骤类型').click();
    cy.get('[data-testid="dynamic-steps"]')
      .should('have.class', 'sd-steps-mode-navigation')
      .and('have.class', 'sd-steps-label-horizontal');
    cy.get('[data-testid="custom-steps"] b').should('have.text', '1:process');
    cy.get('[data-testid="custom-steps"] i').should('have.text', '图标 2');
    cy.get('[data-testid="custom-steps"]')
      .should('contain.text', '自定义标题')
      .and('not.contain.text', '被覆盖标题');
  });
});

export {};
