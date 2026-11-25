describe('React anchor', () => {
  beforeEach(() => cy.visit('/anchor.html'));

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
    cy.get('#anchor-sections-a').then(([container]) => {
      container.style.scrollPaddingTop = '64px';
    });
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').click();
    cy.get('#anchor-sections-a').should(($el) => expect($el[0].scrollTop).to.be.closeTo(180, 1));
  });

  it('keeps the numeric boundary from the physical top in a vertical writing mode', () => {
    cy.contains('button', 'Mount Anchor').click();
    cy.contains('button', 'Toggle Anchor boundary').click();
    cy.get('#anchor-sections-a').then(([container]) => {
      container.style.writingMode = 'vertical-rl';
      container.style.display = 'flex';
      container.style.height = '300px';
      container.querySelectorAll('section').forEach((section) => {
        section.style.flexShrink = '0';
      });
    });
    cy.get('[data-testid="anchor"] a[href="#anchor-a2"]').click();
    cy.get('#anchor-sections-a').should(([container]) => {
      const target = container.querySelector('#anchor-a2')!;
      expect(target.getBoundingClientRect().top - container.getBoundingClientRect().top).to.equal(
        20,
      );
    });
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
      expect(writes.callCount).to.be.greaterThan(0);
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
    cy.visit('/anchor.html#anchor%3A100%25');
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
});
