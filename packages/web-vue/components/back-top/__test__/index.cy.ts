import { defineComponent, h } from 'vue';

import BackTop from '../index';

describe('BackTop', () => {
  it('renders an icon button with an accessible name once visible', () => {
    cy.mount(BackTop);
    // simulate scrolling past visibleHeight so the back-top control mounts
    cy.window().then((win) => {
      Object.defineProperty(win.document.documentElement, 'scrollTop', {
        configurable: true,
        get: () => 500,
      });
      win.dispatchEvent(new win.Event('scroll'));
    });
    cy.get('.sd-back-top-btn')
      .should('have.attr', 'aria-label', '回到顶部')
      .and('have.attr', 'type', 'button')
      .focus()
      .should('have.css', 'box-shadow')
      .and('not.equal', 'none');
    cy.get('.sd-back-top').should('have.css', 'z-index', '999');
  });

  it('scrolls immediately when reduced motion is preferred', () => {
    let scrollTop = 500;

    cy.window().then((win) => {
      cy.stub(win, 'matchMedia').returns({ matches: true } as MediaQueryList);
      Object.defineProperty(win.document.documentElement, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value) => {
          scrollTop = value;
        },
      });
    });

    cy.mount(BackTop);
    cy.window().then((win) => win.dispatchEvent(new win.Event('scroll')));
    cy.get('.sd-back-top-btn').click();
    cy.then(() => expect(scrollTop).to.equal(0));
  });

  // The Cypress page itself never scrolls, so the window scroll position is
  // simulated by redefining `scrollTop` on `documentElement` and dispatching a
  // real `scroll` event on `window`.
  let pageScrollTop = 0;
  const stubPageScrollTop = () => {
    pageScrollTop = 0;
    cy.window().then((win) => {
      Object.defineProperty(win.document.documentElement, 'scrollTop', {
        configurable: true,
        get: () => pageScrollTop,
        set: (value: number) => {
          pageScrollTop = value;
        },
      });
    });
  };
  const scrollPageTo = (value: number) => {
    cy.window().then((win) => {
      pageScrollTop = value;
      win.dispatchEvent(new win.Event('scroll'));
    });
  };
  // BTween drives scrollTop over real frames, so retry until it settles.
  const assertPageScrolledToTop = () => {
    cy.wrap(null).should(() => expect(pageScrollTop).to.equal(0));
  };
  // Guarantees the non-reduced-motion path even if another test's matchMedia
  // stub is still installed (the page is not reloaded between tests).
  const allowMotion = () => {
    cy.window().then((win) => {
      cy.stub(win, 'matchMedia').returns({ matches: false } as MediaQueryList);
    });
  };

  // Harness with a real, scrollable container element so container scrolling
  // is exercised without stubbing scrollTop.
  const ScrollContainerHarness = defineComponent({
    name: 'BackTopScrollContainerHarness',
    setup() {
      return () =>
        h('div', [
          h(
            'div',
            {
              class: 'back-top-scroll-container',
              style: 'height: 100px; overflow-y: auto;',
            },
            [h('div', { style: 'height: 1000px;' })],
          ),
          h(BackTop, { targetContainer: '.back-top-scroll-container' }),
        ]);
    },
  });

  it('is hidden below the threshold and appears exactly at visibleHeight', () => {
    stubPageScrollTop();
    cy.mount(BackTop, { props: { visibleHeight: 300 } });
    cy.get('.sd-back-top').should('not.exist');

    scrollPageTo(299);
    // Let the raf-throttled handler run before the negative check.
    cy.wait(100);
    cy.get('.sd-back-top').should('not.exist');

    scrollPageTo(300);
    cy.get('.sd-back-top').should('exist');
  });

  it('hides again when the page is scrolled back below the threshold', () => {
    stubPageScrollTop();
    cy.mount(BackTop);
    scrollPageTo(500);
    cy.get('.sd-back-top').should('exist');

    scrollPageTo(0);
    cy.get('.sd-back-top').should('not.exist');
  });

  it('animates the scroll back to the top when motion is allowed', () => {
    stubPageScrollTop();
    allowMotion();
    cy.mount(BackTop);
    scrollPageTo(500);
    cy.get('.sd-back-top-btn').click();
    assertPageScrolledToTop();
  });

  it('listens on a scroll container selected by string targetContainer', () => {
    allowMotion();
    cy.mount(ScrollContainerHarness);
    cy.get('.sd-back-top').should('not.exist');

    // A window scroll must not show it: the listener is bound to the container.
    cy.window().then((win) => {
      Object.defineProperty(win.document.documentElement, 'scrollTop', {
        configurable: true,
        get: () => 500,
      });
      win.dispatchEvent(new win.Event('scroll'));
    });
    cy.wait(100);
    cy.get('.sd-back-top').should('not.exist');

    cy.get('.back-top-scroll-container').then(($el) => {
      $el[0].scrollTop = 500;
      $el[0].dispatchEvent(new Event('scroll'));
    });
    cy.get('.sd-back-top').should('exist');

    cy.get('.sd-back-top-btn').click();
    cy.get('.back-top-scroll-container').should('have.prop', 'scrollTop', 0);
    // Programmatic scrollTop fires real scroll events, so the control hides
    // again once the animated scroll has settled.
    cy.get('.sd-back-top').should('not.exist');
  });

  it('listens on a scroll container passed as an element targetContainer', () => {
    allowMotion();
    // The element must exist before BackTop mounts: the prop is captured once
    // during setup.
    const ElementContainerHarness = defineComponent({
      name: 'BackTopElementContainerHarness',
      setup() {
        const container = document.createElement('div');
        container.className = 'back-top-el-container';
        container.style.cssText = 'height: 100px; overflow-y: auto;';
        container.innerHTML = '<div style="height: 1000px"></div>';
        document.body.appendChild(container);
        return () => h(BackTop, { targetContainer: container });
      },
    });

    cy.mount(ElementContainerHarness);
    cy.get('.sd-back-top').should('not.exist');

    cy.get('.back-top-el-container').then(($el) => {
      $el[0].scrollTop = 500;
      $el[0].dispatchEvent(new Event('scroll'));
    });
    cy.get('.sd-back-top').should('exist');

    cy.get('.sd-back-top-btn').click();
    cy.get('.back-top-el-container').should('have.prop', 'scrollTop', 0);
  });

  it('never appears when targetContainer matches no element', () => {
    cy.mount(BackTop, { props: { targetContainer: '.back-top-missing-container' } });
    cy.window().then((win) => win.dispatchEvent(new win.Event('scroll')));
    cy.wait(100);
    cy.get('.sd-back-top').should('not.exist');
  });

  it('renders custom slot content instead of the default button', () => {
    stubPageScrollTop();
    cy.mount(BackTop, {
      slots: { default: '<span class="back-top-custom-content">Top</span>' },
    });
    scrollPageTo(500);
    cy.get('.back-top-custom-content').should('exist');
    cy.get('.sd-back-top-btn').should('not.exist');

    // The click handler sits on the wrapper, so custom content still scrolls up.
    cy.get('.back-top-custom-content').click();
    assertPageScrolledToTop();
  });
});
