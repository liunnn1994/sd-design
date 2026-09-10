import { h, ref } from 'vue';

import Progress from '../index';

describe('Progress', () => {
  it('renders line progress semantics, fill, text and animation', () => {
    cy.mount(Progress, { props: { percent: 0.25, animation: true } });

    cy.get('[role="progressbar"]')
      .should('have.attr', 'aria-valuemin', '0')
      .and('have.attr', 'aria-valuemax', '100')
      .and('have.attr', 'aria-valuenow', '25');
    cy.get('.sd-progress-line-bar').should('have.attr', 'style').and('include', 'width: 25%');
    cy.get('.sd-progress-line-bar').should('have.class', 'sd-progress-line-bar-animate');
    cy.get('.sd-progress-line-text').should('contain.text', '25%');
  });

  it('reacts to percent and inferred status changes', () => {
    const percent = ref(0.4);
    cy.mount(() => h(Progress, { percent: percent.value }));
    cy.get('.sd-progress').should('have.class', 'sd-progress-status-normal');

    cy.then(() => {
      percent.value = 1;
    });
    cy.get('.sd-progress')
      .should('have.class', 'sd-progress-status-success')
      .and('not.have.class', 'sd-progress-status-normal');
    cy.get('[role="progressbar"]').should('have.attr', 'aria-valuenow', '100');
  });

  it('updates a circle from a solid color to a gradient', () => {
    const color = ref<string | Record<string, string>>('#123456');
    cy.mount(() => h(Progress, { type: 'circle', percent: 0.5, color: color.value }));
    cy.get('.sd-progress-circle-bar').should('have.css', 'stroke', 'rgb(18, 52, 86)');
    cy.get('.sd-progress-circle-svg linearGradient').should('not.exist');

    cy.then(() => {
      color.value = { '0%': '#ff0000', '100%': '#0000ff' };
    });
    cy.get('.sd-progress-circle-svg linearGradient').should('exist');
    cy.get('.sd-progress-circle-bar').should('have.attr', 'style').and('contain', 'url(');
  });

  it('uses the requested stroke width and active count in steps mode', () => {
    cy.mount(Progress, { props: { steps: 4, percent: 0.5, strokeWidth: 12 } });
    cy.get('.sd-progress-steps').should('have.css', 'height', '12px');
    cy.get('.sd-progress-steps-item').should('have.length', 4);
    cy.get('.sd-progress-steps-item-active').should('have.length', 2);
    cy.get('[role="progressbar"]').should('have.attr', 'aria-valuenow', '50');
  });

  it('renders mini line progress through the compact circle branch', () => {
    cy.mount(Progress, { props: { size: 'mini', percent: 0.5 } });
    cy.get('.sd-progress').should('have.class', 'sd-progress-type-line');
    cy.get('.sd-progress-circle-wrapper').should('exist');
    cy.get('.sd-progress-line-wrapper').should('not.exist');
  });

  it('passes the fractional percent to the text slot', () => {
    cy.mount(Progress, {
      props: { percent: 0.35 },
      slots: { text: '<span class="custom-progress-text">{{ params.percent }}</span>' },
    });
    cy.get('.custom-progress-text').should('have.text', '0.35');
  });
});
