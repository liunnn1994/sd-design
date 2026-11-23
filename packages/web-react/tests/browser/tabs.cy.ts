describe('React tabs', () => {
  beforeEach(() => cy.visit('/tabs.html'));

  it('switches Tabs by keyboard, skips disabled panes and preserves update/change/click order', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic zero')
      .focus()
      .type('{rightarrow}');
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic two').should(
      'have.attr',
      'aria-selected',
      'true',
    );
    cy.get('[data-testid="tabs-events"]').should(
      'have.text',
      'update:number:2|change:number:2|click:number:2',
    );
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic disabled').click();
    cy.get('[data-testid="tabs-events"]').should(
      'have.text',
      'update:number:2|change:number:2|click:number:2',
    );
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic two').click();
    cy.get('[data-testid="tabs-events"]').should(
      'have.text',
      'update:number:2|change:number:2|click:number:2|click:number:2',
    );
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic two').focus().type('{end}');
    cy.focused().should('contain.text', 'Basic three').type('{home}');
    cy.focused().should('contain.text', 'Basic zero');
    cy.contains('button', 'Toggle Tabs RTL').click();
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic zero')
      .focus()
      .type('{leftarrow}');
    cy.focused().should('contain.text', 'Basic two');
    cy.get('[data-testid="tabs-basic"] [role="tabpanel"]').each(($panel) => {
      const tab = $panel[0].ownerDocument.getElementById($panel.attr('aria-labelledby')!);
      expect(tab?.getAttribute('aria-controls')).to.equal($panel.attr('id'));
    });
    cy.contains('button', 'Tabs extra').click();
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic two').should(
      'have.attr',
      'aria-selected',
      'true',
    );
  });

  it('keeps controlled numeric and string Tabs keys distinct and supports hover activation', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.get(
      '[data-testid="tabs-controlled"] [role="tab"], [data-testid="tabs-controlled"] [role="tabpanel"]',
    ).should(($elements) => {
      expect($elements).to.have.length(4);
      expect(new Set([...$elements].map((element) => element.id)).size).to.equal(4);
      for (const tab of $elements.filter('[role="tab"]')) {
        const panel = tab.ownerDocument.getElementById(tab.getAttribute('aria-controls')!);
        expect(panel?.getAttribute('aria-labelledby')).to.equal(tab.id);
      }
    });
    cy.contains('[data-testid="tabs-controlled"] [role="tab"]', 'Controlled string')
      .click()
      .should('have.attr', 'aria-selected', 'false');
    cy.get('[data-testid="tabs-events"]').should('have.text', 'request:string:0');
    cy.contains('button', 'Allow Tabs writeback').click();
    cy.contains('[data-testid="tabs-controlled"] [role="tab"]', 'Controlled string')
      .click()
      .should('have.attr', 'aria-selected', 'true');
    cy.contains('[data-testid="tabs-controlled"] [role="tab"]', 'Controlled number').should(
      'have.attr',
      'aria-selected',
      'false',
    );
    cy.contains('[data-testid="tabs-controlled"] [role="tab"]', 'Controlled string')
      .focus()
      .type('{home}');
    cy.contains('[data-testid="tabs-controlled"] [role="tab"]', 'Controlled number')
      .should('be.focused')
      .and('have.attr', 'aria-selected', 'true');
    cy.contains('[data-testid="tabs-hover"] [role="tab"]', 'Hover B')
      .trigger('mouseover')
      .should('have.attr', 'aria-selected', 'true');
    cy.contains('[data-testid="tabs-hover"] [role="tab"]', 'Hover A')
      .focus()
      .type(' ')
      .should('have.attr', 'aria-selected', 'true');
  });

  it('adds Tabs after rendering, auto-selects the new pane and closes inactive panes without selecting them', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.get('[data-testid="tabs-edit"] .sd-tabs-nav-add-btn').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
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
      .focus()
      .should('be.focused');
    cy.press(Cypress.Keyboard.Keys.ENTER);
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e1').should('not.exist');
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e3').should(
      'have.attr',
      'aria-selected',
      'true',
    );
    cy.get('[data-testid="tabs-events"]').should('have.text', 'delete:e1');

    cy.get('[data-testid="tabs-edit"] .sd-tabs-nav-add-btn').click();
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e3')
      .find('.sd-tabs-tab-close-btn')
      .click();
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e3').should('not.exist');
    cy.contains('[data-testid="tabs-edit"] [role="tab"]', 'Editable e4').should(
      'have.attr',
      'aria-selected',
      'true',
    );
    cy.get('[data-testid="tabs-events"]').should('have.text', 'delete:e1|delete:e3');
  });

  it('keeps keyboard focus targets when a parent retains a closed tab and ignores disabled close buttons', () => {
    cy.visit('/tabs.html?scenario=keys');
    cy.contains('button', 'Mount Tabs').click();
    const tabs = '[data-testid="tabs-controlled"] [role="tab"]';
    cy.contains(tabs, 'Controlled disabled').find('.sd-tabs-tab-close-btn').click({ force: true });
    cy.get('[data-testid="tabs-events"]').should('be.empty');
    cy.contains(tabs, 'Controlled string').find('.sd-tabs-tab-close-btn').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="tabs-events"]').should('have.text', 'delete:string:0');
    cy.contains(tabs, 'Controlled number').should('have.attr', 'aria-selected', 'true');
    cy.contains(tabs, 'Controlled number').focus().type('{rightarrow}');
    cy.contains(tabs, 'Controlled string')
      .should('be.focused')
      .and('have.attr', 'aria-selected', 'false');
    cy.get('[data-testid="tabs-events"]').should('have.text', 'delete:string:0|request:string:0');
  });

  it('renders the selected indicator and panel for a prototype-named key', () => {
    cy.visit('/tabs.html?scenario=keys');
    cy.contains('button', 'Mount Tabs').click();
    cy.get('[data-testid="tabs-prototype"]').within(() => {
      cy.get('[role="tab"]').should('have.attr', 'aria-selected', 'true');
      cy.get('[role="tabpanel"]').should('be.visible').and('have.text', 'Prototype panel');
      cy.get('.sd-tabs-nav-ink').should(([$ink]) => {
        expect($ink.getBoundingClientRect().width).to.be.greaterThan(0);
      });
    });
  });

  it('requests an addition without emitting an active key when the parent leaves the list empty', () => {
    cy.visit('/tabs.html?scenario=empty');
    cy.contains('button', 'Mount Tabs').click();
    cy.get('[data-testid="tabs-edit"] .sd-tabs-nav-add-btn').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="tabs-events"]').should('have.text', 'add');
    cy.get('[data-testid="tabs-edit"] [role="tab"]').should('not.exist');
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
    const next = '[data-testid="tabs-overflow"] .sd-tabs-nav-button-right';
    cy.get(next).should('have.attr', 'aria-label');
    cy.get(next).focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
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

  it('updates horizontal and vertical ink transitions and mirrors the content slide in RTL', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.get('select[aria-label="Tabs type"]').select('line');
    cy.contains('[data-testid="tabs-style"] [role="tab"]', 'A substantially longer title').click();
    const content = '[data-testid="tabs-style"] .sd-tabs-content-list';
    const ink = '[data-testid="tabs-style"] .sd-tabs-nav-ink';
    cy.get(content).should('have.css', 'transition-property', 'transform');
    cy.get(content).should('have.attr', 'style').and('include', 'translateX(-100%)');
    cy.contains('button', 'Toggle Tabs RTL').click();
    cy.get(content).should('have.attr', 'style').and('include', 'translateX(100%)');
    for (const position of ['top', 'left']) {
      cy.get('select[aria-label="Tabs position"]').select(position);
      cy.get(ink).should(([$ink]) => {
        const durations = getComputedStyle($ink).transitionDuration.split(',');
        expect(durations.every((duration) => parseFloat(duration) > 0)).to.equal(true);
      });
      cy.contains('button', 'Toggle Tabs animation').click();
      cy.get(ink).should('have.css', 'transition-duration', '0s');
      cy.contains('button', 'Toggle Tabs animation').click();
    }
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
      cy.get('[data-testid="tabs-style"]')
        .children()
        .first()
        .should('have.class', position === 'bottom' ? 'sd-tabs-content' : 'sd-tabs-nav');
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

  it('shows the capsule keyboard outline and applies RTL tab header spacing', () => {
    cy.contains('button', 'Mount Tabs').click();
    const root = () => cy.get('[data-testid="tabs-style"]');
    const tabs = () => root().find('[role="tab"]');
    tabs().first().focus().type('{rightarrow}');
    tabs().last().should('be.focused').and('have.attr', 'aria-selected', 'true');
    tabs()
      .last()
      .should('have.css', 'outline-style', 'solid')
      .and('have.css', 'outline-width', '2px')
      .and('have.css', 'outline-offset', '-2px');
    tabs().last().should('have.attr', 'tabindex', '0');
    tabs().first().should('have.attr', 'tabindex', '-1');

    cy.get('select[aria-label="Tabs type"]').select('line');
    root().invoke('css', '--component-tabs-line-margin-title-horizontal-first', '23px');
    tabs().first().should('have.css', 'margin-left', '23px');
    cy.contains('button', 'Toggle Tabs header and content').click();
    tabs().first().should('have.css', 'margin-left', '0px');
    cy.contains('button', 'Toggle Tabs RTL').click();
    root().should('have.class', 'sd-tabs-rtl');
    tabs().first().should('have.css', 'margin-right', '0px');

    cy.get('select[aria-label="Tabs type"]').select('card-gutter');
    tabs().first().should('have.css', 'margin-right', '0px');
    tabs().last().should('have.css', 'margin-right', '4px');
    tabs().last().should('have.css', 'margin-left', '0px');
  });

  it('mirrors editable card edges, corners and close-button spacing in RTL', () => {
    cy.visit('/tabs.html?scenario=rtl-card');
    cy.contains('button', 'Mount Tabs').click();
    cy.get('select[aria-label="Tabs type"]').select('card');
    cy.contains('button', 'Toggle Tabs RTL').click();
    const root = () => cy.get('[data-testid="tabs-style"]');
    const tabs = () => root().find('[role="tab"]');
    root().should('have.class', 'sd-tabs-rtl');
    root().invoke('css', '--component-tabs-card-border-radius', '13px');
    tabs()
      .first()
      .should('have.css', 'border-left-width', '0px')
      .and('have.css', 'border-right-width', '1px')
      .and('have.css', 'border-top-left-radius', '0px')
      .and('have.css', 'border-top-right-radius', '13px')
      .and('have.css', 'padding-left', '12px')
      .and('have.css', 'padding-right', '16px');
    tabs()
      .last()
      .should('have.css', 'border-left-width', '1px')
      .and('have.css', 'border-top-left-radius', '13px')
      .and('have.css', 'border-top-right-radius', '0px');
    tabs()
      .first()
      .find('.sd-tabs-tab-close-btn')
      .should('have.css', 'margin-left', '0px')
      .and('have.css', 'margin-right', '8px');
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
});
