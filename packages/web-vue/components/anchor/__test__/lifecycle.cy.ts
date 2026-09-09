import { defineComponent, ref } from 'vue';

describe('Anchor scroll and link lifecycle', () => {
  beforeEach(() => {
    cy.window().then((win) => win.history.replaceState(null, '', win.location.pathname));
  });

  const mountNavigation = (smooth = false) => {
    cy.mount(
      defineComponent({
        setup() {
          return {
            smooth,
            href: ref('#section-1'),
            showFirst: ref(true),
            showNavigation: ref(true),
          };
        },
        template: `
        <button data-test="rename" @click="href = '#section-3'">Rename link</button>
        <button data-test="remove" @click="showFirst = false">Remove link</button>
        <button data-test="unmount" @click="showNavigation = false">Remove navigation</button>
        <div id="sections" style="height: 180px; overflow: auto">
          <section id="section-1" style="height: 200px">First</section>
          <section id="section-2" style="height: 200px">Second</section>
          <section id="section-3" style="height: 200px">Third</section>
        </div>
        <sd-anchor v-if="showNavigation" scroll-container="#sections" :smooth="smooth" :change-hash="false" :target-offset="100">
          <sd-anchor-link v-if="showFirst" :href="href" title="Dynamic link" />
          <sd-anchor-link href="#section-2" title="Second link" />
        </sd-anchor>
      `,
      }),
    );
  };

  for (const smooth of [false, true]) {
    it(`resumes scroll tracking after clicking with smooth=${smooth}`, () => {
      mountNavigation(smooth);
      cy.get('a[href="#section-2"]').click();
      // The tween lasts 300 ms; manual scrolling here tests the completed animation.
      if (smooth) cy.wait(350);
      cy.get('#sections').should(($el) => expect($el[0].scrollTop).to.be.closeTo(200, 1));
      cy.get('a[href="#section-2"]').should('have.attr', 'aria-current', 'location');
      cy.get('#sections').scrollTo(0, 0);
      cy.get('a[href="#section-1"]').should('have.attr', 'aria-current', 'location');
      cy.location('hash').should('equal', '');
    });
  }

  it('registers a changed href for scroll tracking', () => {
    mountNavigation();
    cy.get('[data-test="rename"]').click();
    cy.get('#sections').scrollTo(0, 400);
    cy.get('a[href="#section-3"]').should('have.attr', 'aria-current', 'location');
    cy.get('.sd-anchor-line-slider').should('have.css', 'top', '0px');
  });

  it('stops a pending smooth scroll when unmounted', () => {
    mountNavigation(true);
    cy.get('a[href="#section-2"]').then(($link) => {
      const container = $link[0].ownerDocument.getElementById('sections')!;
      $link[0].click();
      cy.get('[data-test="unmount"]').click();
      cy.get('.sd-anchor')
        .should('not.exist')
        .then(() => {
          const scrollTop = container.scrollTop;
          cy.wait(350).then(() => expect(container.scrollTop).to.equal(scrollTop));
        });
    });
  });

  it('does not activate a removed link when its section comes into view', () => {
    mountNavigation();
    cy.get('#sections').scrollTo(0, 200);
    cy.get('a[href="#section-2"]').should('have.attr', 'aria-current', 'location');
    cy.get('[data-test="remove"]').click();
    cy.get('#sections').scrollTo(0, 0);
    cy.window().then(
      (win) =>
        new Cypress.Promise<void>((resolve) => {
          win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
        }),
    );
    cy.get('a[href="#section-2"]').should('have.attr', 'aria-current', 'location');
  });

  it('tracks a replacement scroll container', () => {
    cy.mount(
      defineComponent({
        setup() {
          return { target: ref('#box-a') };
        },
        template: `
        <button data-test="target" @click="target = '#box-b'">Change container</button>
        <div id="box-a" style="height: 180px; overflow: auto">
          <section id="a1" style="height: 200px">A1</section>
          <section id="a2" style="height: 200px">A2</section>
        </div>
        <div id="box-b" style="height: 180px; overflow: auto">
          <section id="b1" style="height: 200px">B1</section>
          <section id="b2" style="height: 200px">B2</section>
        </div>
        <sd-anchor :scroll-container="target" :target-offset="100" :change-hash="false">
          <sd-anchor-link href="#a1" title="A1" />
          <sd-anchor-link href="#a2" title="A2" />
          <sd-anchor-link href="#b1" title="B1" />
          <sd-anchor-link href="#b2" title="B2" />
        </sd-anchor>
      `,
      }),
    );
    cy.get('#box-a').scrollTo(0, 200);
    cy.get('a[href="#a2"]').should('have.attr', 'aria-current', 'location');
    cy.get('[data-test="target"]').click();
    cy.get('a[href="#b1"]').should('have.attr', 'aria-current', 'location');
    cy.get('#box-b').scrollTo(0, 200);
    cy.get('a[href="#b2"]').should('have.attr', 'aria-current', 'location');
  });
});
