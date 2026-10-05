import type { ThinkingOrbState } from '../types';

import { MODE_DRAWS } from '../engine/registry';
import ThinkingOrb from '../index';
import { STATE_TO_MODE, resolvePreset } from '../presets';

describe('ThinkingOrb renderer boundaries', () => {
  it('renders every state at negative phases without invalid geometry', () => {
    cy.document().then((doc) => {
      const canvas = doc.createElement('canvas');
      const context = canvas.getContext('2d')!;
      const arc = cy.spy(context, 'arc');
      for (const state of Object.keys(STATE_TO_MODE) as ThinkingOrbState[]) {
        for (const size of [20, 64] as const) {
          const { mode, opts } = resolvePreset(state, size);
          for (const phase of [-0.1, -10]) {
            expect(
              () => MODE_DRAWS[mode](context, size, phase, false, opts),
              `${state}/${size}/${phase}`,
            ).not.to.throw();
          }
        }
      }
      expect(arc.callCount).to.be.greaterThan(0);
      for (const call of arc.getCalls()) {
        expect(call.args.every(Number.isFinite)).to.equal(true);
      }
    });
  });

  it('does not start animation on a hidden page without IntersectionObserver', () => {
    let visibility: DocumentVisibilityState = 'hidden';
    cy.window().then((win) => {
      cy.stub(win, 'IntersectionObserver').value(undefined);
      cy.stub(win.document, 'visibilityState').get(() => visibility);
      cy.spy(win, 'requestAnimationFrame').as('frames');
    });
    cy.mount(ThinkingOrb);
    cy.get('.sd-thinking-orb').should('exist');
    cy.get('@frames').should('not.have.been.called');
    cy.document().then((doc) => {
      visibility = 'visible';
      doc.dispatchEvent(new Event('visibilitychange'));
    });
    cy.get('@frames').should('have.been.called');
  });
});
