import { h, nextTick, ref } from 'vue';

import Trigger from '../index';

const slots = { default: '<button>Open</button>', content: '<div class="popup-body">Popup</div>' };

describe('Trigger robustness', () => {
  it('opens after the hover delay elapses', () => {
    cy.mount(Trigger, { props: { mouseEnterDelay: 200, ariaHasPopup: 'menu' }, slots });
    cy.get('button').trigger('mouseenter');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
  });

  for (const change of [{ disabled: true }, { trigger: 'click' as const }]) {
    it(`cancels a delayed open after ${Object.keys(change)[0]} changes`, () => {
      cy.mount(Trigger, { props: { mouseEnterDelay: 200, ariaHasPopup: 'menu' }, slots });
      cy.get('button').trigger('mouseenter');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps(change));
      cy.wait(250);
      cy.get('button').should('have.attr', 'aria-expanded', 'false');
    });
  }

  it('refreshes popup attributes while it remains open', () => {
    const label = ref('First');
    cy.mount({
      setup: () => () =>
        h(
          Trigger,
          { 'defaultPopupVisible': true, 'data-label': label.value },
          {
            default: () => h('button', 'Open'),
            content: () => h('span', 'Popup'),
          },
        ),
    });
    cy.get('.sd-trigger-popup').should('have.attr', 'data-label', 'First');
    cy.then(() => {
      label.value = 'Second';
    });
    cy.get('.sd-trigger-popup').should('have.attr', 'data-label', 'Second');
  });

  for (const [distance, updateAtScroll] of [
    [0, false],
    [30, false],
    [30, true],
  ] as const) {
    it(`closes on ancestor scroll with distance ${distance}, updateAtScroll=${updateAtScroll}`, () => {
      cy.mount({
        setup: () => () =>
          h('div', { class: 'scroll-host', style: 'height:100px;overflow:auto' }, [
            h(
              Trigger,
              {
                defaultPopupVisible: true,
                scrollToClose: true,
                scrollToCloseDistance: distance,
                updateAtScroll,
              },
              {
                default: () => h('button', 'Open'),
                content: () => h('div', { class: 'popup-body' }, 'Popup'),
              },
            ),
            h('div', { style: 'height:1000px' }),
          ]),
      });
      cy.get('.popup-body').should('be.visible');
      cy.get('.scroll-host').scrollTo(0, 40);
      cy.get('.popup-body').should('not.be.visible');
    });
  }
  for (const dynamic of [false, true]) {
    it(`measures window scroll distance from opening, dynamic=${dynamic}`, () => {
      cy.window().then((win) => win.scrollTo(0, 0));
      const enabled = ref(!dynamic);
      const change = cy.spy().as('change');
      cy.mount({
        setup: () => () =>
          h('div', [
            h(
              Trigger,
              {
                defaultPopupVisible: true,
                scrollToClose: enabled.value,
                scrollToCloseDistance: 30,
                onPopupVisibleChange: change,
              },
              {
                default: () => h('button', 'Open'),
                content: () => h('span', 'Popup'),
              },
            ),
            h('div', { style: 'height:2000px' }),
          ]),
      });
      cy.get('.sd-trigger-popup').should('be.visible');
      if (dynamic)
        cy.then(() => {
          enabled.value = true;
          return nextTick();
        });
      cy.scrollTo(0, 20);
      cy.wait(50);
      cy.get('@change').should('not.have.been.called');
      cy.scrollTo(0, 40);
      cy.get('@change').should('have.been.calledWith', false);
    });
  }
  for (const target of ['window', 'ancestor']) {
    it(`does not emit for queued ${target} scroll after unmount`, () => {
      const change = cy.spy().as('change');
      cy.mount({
        setup: () => () =>
          h('div', { class: 'scroll-host', style: 'height:100px;overflow:auto' }, [
            h(
              Trigger,
              { defaultPopupVisible: true, scrollToClose: true, onPopupVisibleChange: change },
              {
                default: () => h('button', 'Open'),
                content: () => h('div', { class: 'popup-body' }, 'Popup'),
              },
            ),
            h('div', { style: 'height:1000px' }),
          ]),
      });
      cy.get('.popup-body').should('be.visible');
      cy.get('@vue').then(({ wrapper }) => {
        const doc = wrapper.element.ownerDocument;
        const win = doc.defaultView!;
        const element = target === 'window' ? doc : doc.querySelector('.scroll-host')!;
        element.dispatchEvent(new win.Event('scroll', { bubbles: target === 'window' }));
        wrapper.unmount();
        return new Promise<void>((resolve) => {
          win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
        });
      });
      cy.get('@change').should('not.have.been.called');
    });
  }
});
