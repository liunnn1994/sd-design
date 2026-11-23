describe('React Tooltip', () => {
  beforeEach(() => cy.visit('/tooltip.html'));

  it('connects tooltip descriptions and allows interaction when content overflows', () => {
    cy.contains('button', '普通提示').focus();
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '普通提示内容')
      .and('have.class', 'sd-tooltip-mouse-through')
      .and('have.css', 'pointer-events', 'none');
    cy.get('[role="tooltip"]')
      .invoke('attr', 'id')
      .then((id) => {
        expect(id).to.match(/\S/);
        cy.contains('button', '普通提示').should('have.attr', 'aria-describedby', id);
      });
    cy.contains('button', '普通提示').blur();
    cy.get('[role="tooltip"]').should('not.exist');
    cy.contains('button', '普通提示').should('not.have.attr', 'aria-describedby');
    cy.contains('button', '溢出提示').focus();
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '溢出提示内容')
      .and('not.have.class', 'sd-tooltip-mouse-through');
    cy.contains('button', '溢出提示').blur();
    cy.contains('button', '锁定提示').focus();
    cy.contains('受控拒绝提示').should('not.exist');
  });

  it('delays hover transitions, cancels a pending open and emits each committed visibility', () => {
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout']);
    const reference = () => cy.contains('button', 'Changing reference');
    const popup = () => cy.get('#tooltip-host [role="tooltip"]');
    reference().trigger('mouseover');
    cy.tick(99);
    popup().should('not.exist');
    reference().trigger('mouseout', { eventConstructor: 'MouseEvent' });
    cy.tick(200);
    popup().should('not.exist');
    cy.get('[data-testid="tooltip-events"]').should('be.empty');
    reference().trigger('mouseover');
    cy.tick(100);
    popup().should('be.visible');
    cy.get('[data-testid="tooltip-events"]').should('have.text', 'true');
    reference().trigger('mouseout', { eventConstructor: 'MouseEvent' });
    cy.get('body').trigger('mousemove', {
      eventConstructor: 'MouseEvent',
      clientX: 0,
      clientY: 0,
      force: true,
    });
    cy.tick(79);
    cy.get('[data-testid="tooltip-events"]').should('have.text', 'true');
    cy.tick(1);
    cy.get('[data-testid="tooltip-events"]').should('have.text', 'true|false');
  });

  it('uses the requested container, background, classes and compact size', () => {
    cy.contains('button', 'Changing reference').focus();
    cy.get('#tooltip-host [role="tooltip"]').should('be.visible');
    cy.get('#tooltip-host .custom-content')
      .should('have.class', 'sd-tooltip-mini')
      .and('contain.text', 'Changing tooltip')
      .and('have.css', 'background-color', 'rgb(17, 34, 51)');
    cy.get('#tooltip-host .custom-arrow').should('have.css', 'background-color', 'rgb(17, 34, 51)');
  });

  it('makes growing content interactive and becomes mouse-through again after shrinking', () => {
    cy.contains('button', 'Changing reference').focus();
    cy.get('#tooltip-host [role="tooltip"]').should('have.class', 'sd-tooltip-mouse-through');
    cy.contains('button', 'Resize tooltip').click();
    cy.get('#tooltip-host [role="tooltip"]').should('not.have.class', 'sd-tooltip-mouse-through');
    cy.contains('button', 'Resize tooltip').click();
    cy.get('#tooltip-host [role="tooltip"]').should('have.class', 'sd-tooltip-mouse-through');
    cy.contains('button', 'Changing reference').should('be.focused');
  });

  it('cleans the description and portal on disable and unmount', () => {
    const reference = () => cy.contains('button', 'Changing reference');
    const popup = () => cy.get('#tooltip-host [role="tooltip"]');
    reference().focus();
    popup().should('be.visible');
    cy.contains('button', 'Toggle disabled').click();
    popup().should('not.exist');
    reference().should('not.have.attr', 'aria-describedby');
    cy.contains('button', 'Toggle disabled').click();
    reference().blur();
    reference().focus();
    popup().should('be.visible');
    cy.contains('button', 'Toggle tooltip').click();
    popup().should('not.exist');
    reference().should('not.exist');
  });

  it('restores the last focus request when controlled tooltip visibility is released', () => {
    const reference = () => cy.contains('button', '锁定提示');
    const popup = () => cy.contains('[role="tooltip"]', '受控拒绝提示');
    const toggle = () => cy.contains('button', 'Toggle controlled tooltip').click();
    const events = () => cy.get('[data-testid="tooltip-locked-events"]');
    reference().focus();
    events().should('have.text', 'true');
    popup().should('not.exist');
    reference().should('not.have.attr', 'aria-describedby');
    toggle();
    popup().should('be.visible');
    toggle();
    popup().should('not.exist');
    events().should('have.text', 'true|false');
    reference().blur();
    reference().focus();
    events().should('have.text', 'true|false|true');

    cy.contains('button', 'Release controlled tooltip').click();
    popup().should('be.visible');
    reference().should('be.focused').and('have.attr', 'aria-describedby');
    reference().blur();
    popup().should('not.exist');
    reference().should('not.have.attr', 'aria-describedby');
    events().should('have.text', 'true|false|true|false');
  });

  it('retains the initial default when controlled visibility is released without a request', () => {
    cy.visit('/tooltip.html?fallback');
    const reference = () => cy.contains('button', '锁定提示');
    const popup = () => cy.contains('[role="tooltip"]', '受控拒绝提示');
    const updateParent = (label: string) =>
      cy.contains('button', label).then(([$button]) => $button.click());
    popup().should('not.exist');
    updateParent('Open controlled tooltip and change default');
    popup().should('be.visible');
    reference().should('have.attr', 'aria-describedby');
    cy.get('[data-testid="tooltip-locked-events"]').should('be.empty');
    updateParent('Release controlled tooltip');
    popup().should('not.exist');
    reference().should('not.have.attr', 'aria-describedby');
    cy.get('[data-testid="tooltip-locked-events"]').should('be.empty');
  });

  it('removes the portal when the reference DOM disappears before the component unmounts', () => {
    const reference = () => cy.contains('button', 'Changing reference');
    reference().focus();
    cy.get('#tooltip-host [role="tooltip"]').should('be.visible');
    reference().then(([$reference]) => $reference.remove());
    cy.get('#tooltip-host [role="tooltip"]').should('not.exist');
    cy.get('[data-testid="tooltip-events"]').should('have.text', 'true|false');
  });

  for (const controlled of [false, true]) {
    it(`suppresses an open ${controlled ? 'controlled' : 'uncontrolled'} tooltip while its reference ancestor is hidden`, () => {
      cy.visit(`/tooltip.html?reference${controlled ? '&controlled' : ''}`);
      const reference = () => cy.contains('button', 'Lifecycle reference');
      const popup = () => cy.contains('[role="tooltip"]', 'Lifecycle help');
      if (!controlled) reference().trigger('mouseover');
      popup().should('be.visible');
      reference()
        .should('have.attr', 'aria-describedby')
        .and('match', /^existing-description\s+\S+/);
      cy.contains('button', 'Toggle reference ancestor').click();
      if (controlled) popup().should('not.be.visible');
      else {
        popup().should('not.exist');
        reference().should('have.attr', 'aria-describedby', 'existing-description');
      }
      cy.contains('button', 'Toggle reference ancestor').click();
      reference().should('be.visible');
      if (!controlled) {
        popup().should('not.exist');
        reference().trigger('mouseover');
      }
      popup().should('be.visible');
    });
  }
});

describe('React Tooltip viewport boundaries', () => {
  const content = '.sd-tooltip-content';
  const viewport = '.sd-tooltip-scrollbar [data-overlayscrollbars-viewport]';

  for (const position of ['top', 'bottom', 'left', 'right']) {
    it(`keeps long ${position} content within the viewport before and after resizing`, () => {
      const expectInViewport = ([$popup]: JQuery<HTMLElement>) => {
        const bounds = $popup.getBoundingClientRect();
        const win = $popup.ownerDocument.defaultView!;
        expect(bounds.left).to.be.at.least(7);
        expect(bounds.top).to.be.at.least(7);
        expect(bounds.right).to.be.at.most(win.innerWidth - 7);
        expect(bounds.bottom).to.be.at.most(win.innerHeight - 7);
      };
      cy.viewport(480, 320);
      cy.visit(`/tooltip.html?boundary&position=${position}`);
      cy.get(content).should('be.visible').and(expectInViewport);
      cy.get('[role="tooltip"]').should('have.css', 'pointer-events', 'auto');
      cy.get(viewport)
        .scrollTo('bottom')
        .should(([$viewport]) => {
          expect($viewport.scrollTop).to.be.greaterThan(0);
        });
      cy.viewport(280, 240);
      cy.get(content).should('be.visible').and(expectInViewport);
    });
  }

  it('keeps long content inside a clipped portal and open while scrolling', () => {
    cy.viewport(480, 320);
    cy.visit('/tooltip.html?boundary&clipped');
    cy.contains('button', 'Boundary reference').trigger('mouseover');
    cy.get(`#tooltip-boundary ${content}`).should(([$popup]) => {
      const bounds = $popup.getBoundingClientRect();
      const clip = $popup.ownerDocument.querySelector('#tooltip-boundary')!.getBoundingClientRect();
      expect(bounds.left).to.be.at.least(clip.left + 7);
      expect(bounds.top).to.be.at.least(clip.top + 7);
      expect(bounds.right).to.be.at.most(clip.right - 7);
      expect(bounds.bottom).to.be.at.most(clip.bottom - 7);
    });
    cy.get('[role="tooltip"]').should('have.css', 'pointer-events', 'auto');
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout']);
    cy.contains('button', 'Boundary reference').trigger('mouseout', {
      eventConstructor: 'MouseEvent',
    });
    cy.get('[role="tooltip"]').trigger('mouseover');
    cy.get(viewport)
      .scrollTo('bottom')
      .should(([$viewport]) => {
        expect($viewport.scrollTop).to.be.greaterThan(0);
      });
    cy.tick(101);
    cy.get(content).should('be.visible');
  });
});
