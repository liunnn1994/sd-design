import { defineComponent, h } from 'vue';

import Progress from '../index';

describe('Progress render boundaries', () => {
  it('gives separate circle gradients unique ids and references', () => {
    cy.mount(
      defineComponent({
        setup: () => () => [
          h(Progress, { type: 'circle', color: { '0%': '#ff0000', '100%': '#0000ff' } }),
          h(Progress, { type: 'circle', color: { '0%': '#00ff00', '100%': '#ffff00' } }),
        ],
      }),
    );
    cy.get('.sd-progress-circle-svg linearGradient').should(($gradients) => {
      const ids = [...$gradients].map((gradient) => gradient.id);
      expect(new Set(ids).size).to.equal(2);
    });
    cy.get('.sd-progress-circle-svg').each(($svg) => {
      const id = $svg.find('linearGradient').attr('id');
      const stroke = ($svg.find('.sd-progress-circle-bar')[0] as SVGElement).style.stroke;
      expect(stroke.replace(/["']/g, '')).to.equal(`url(#${id})`);
    });
  });

  it('shows the danger icon in steps mode and removes it when status changes', () => {
    cy.mount(Progress, { props: { steps: 4, percent: 0.5, status: 'danger' } });
    cy.get('.sd-progress-steps-text .sd-icon-exclamation-circle-fill').should('exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ status: 'normal' }));
    cy.get('.sd-progress-steps-text .sd-icon-exclamation-circle-fill').should('not.exist');
  });
});
