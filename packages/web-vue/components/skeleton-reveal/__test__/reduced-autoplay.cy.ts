import { h } from 'vue';

import SkeletonReveal from '../index';

describe('SkeletonReveal reduced-motion autoplay', () => {
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );

  it('shows autoplay content on initial mount without requiring replay', () => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    cy.mount(SkeletonReveal, {
      props: { autoplay: true },
      slots: { default: () => h('button', 'Visible content') },
    });
    cy.get('.sd-skeleton-reveal-content').should('have.css', 'opacity', '1');
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
  });
});
