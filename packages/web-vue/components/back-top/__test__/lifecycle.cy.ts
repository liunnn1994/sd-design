import { defineComponent, ref } from 'vue';

describe('BackTop lifecycle in real scroll containers', () => {
  const mountControls = (duration = 200) => {
    cy.window().then((win) =>
      cy.stub(win, 'matchMedia').returns({ matches: false } as MediaQueryList),
    );
    cy.mount(
      defineComponent({
        setup: () => ({ target: ref('#scroll-a'), height: ref(200), show: ref(true), duration }),
        template: `
        <button data-test="target" @click="target = '#scroll-b'">Switch target</button>
        <button data-test="threshold" @click="height = 50">Lower threshold</button>
        <button data-test="remove" @click="show = false">Unmount</button>
        <div id="scroll-a" style="height: 100px; overflow: auto"><div style="height: 1000px">A</div></div>
        <div id="scroll-b" style="height: 100px; overflow: auto"><div style="height: 1000px">B</div></div>
        <sd-back-top v-if="show" :target-container="target" :visible-height="height" :duration="duration" />
      `,
      }),
    );
  };

  it('updates visibility when visibleHeight changes without another scroll', () => {
    mountControls();
    cy.get('#scroll-a').scrollTo(0, 100);
    cy.get('.sd-back-top').should('not.exist');
    cy.get('[data-test="threshold"]').click();
    cy.get('.sd-back-top-btn').should('be.visible');
  });

  it('switches the scroll listener and scroll destination to the new container', () => {
    mountControls();
    cy.get('#scroll-a').scrollTo(0, 500);
    cy.get('.sd-back-top-btn').should('be.visible');
    cy.get('[data-test="target"]').click();
    cy.get('.sd-back-top').should('not.exist');
    cy.get('#scroll-b').scrollTo(0, 500);
    cy.get('.sd-back-top-btn').click();
    cy.get('#scroll-b').should('have.prop', 'scrollTop', 0);
    cy.get('#scroll-a').should('have.prop', 'scrollTop', 500);
  });

  it('treats duration zero as an immediate return to the top', () => {
    mountControls(0);
    cy.get('#scroll-a').scrollTo(0, 500);
    cy.get('.sd-back-top-btn')
      .should('be.visible')
      .then(($button) => {
        $button[0].click();
        expect($button[0].ownerDocument.getElementById('scroll-a')!.scrollTop).to.equal(0);
      });
  });

  it('stops the scroll animation when the component unmounts', () => {
    mountControls(600);
    cy.get('#scroll-a').scrollTo(0, 500);
    cy.get('.sd-back-top-btn').click();
    cy.get('[data-test="remove"]').click();
    cy.get('#scroll-a').then(($container) => {
      const position = $container[0].scrollTop;
      expect(position).to.be.greaterThan(0);
      cy.wait(650).then(() => expect($container[0].scrollTop).to.equal(position));
    });
  });

  it('activates the default button with Enter', () => {
    mountControls();
    cy.get('#scroll-a').scrollTo(0, 500);
    cy.get('#scroll-a').click();
    cy.get('.sd-back-top-btn').focus().should('be.focused');
    // Include Enter's text event so Chrome performs native button activation.
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
    cy.get('#scroll-a').should('have.prop', 'scrollTop', 0);
    cy.get('.sd-back-top').should('not.exist');
  });
});
