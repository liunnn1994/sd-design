import { defineComponent, h } from 'vue';

import catalog from '../../../icon/icons.json';
import IconPlus from '../icon-plus';
import * as Icons from '../index';

describe('Generated icon catalog and updates', () => {
  it('renders every catalog export as a nonempty SVG', () => {
    const entries = Object.entries(Icons).filter(([name]) => name !== 'default');
    const expected = catalog.flatMap((category) => category.list.map((item) => item.componentName));
    expect(entries.map(([name]) => name).sort()).to.deep.equal(expected.sort());
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            'div',
            entries.map(([name, component]) => h(component, { 'data-icon': name })),
          ),
      }),
    );
    cy.get('svg[data-icon]')
      .should('have.length', expected.length)
      .each(($svg) => {
        const svg = $svg[0] as unknown as SVGSVGElement;
        expect(svg.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(svg.viewBox.baseVal.width).to.be.greaterThan(0);
        expect(svg.viewBox.baseVal.height).to.be.greaterThan(0);
        const box = svg.getBBox();
        expect(box.width + box.height, svg.getAttribute('data-icon')!).to.be.greaterThan(0);
      });
  });

  it('updates stroke and rotation and stops the real spin animation', () => {
    cy.mount(IconPlus, { props: { spin: true, rotate: 90 } });
    cy.get('svg').should(($svg) => {
      const animations = $svg[0].getAnimations();
      expect(animations).to.have.length(1);
      expect(animations[0].playState).to.equal('running');
      expect(Number(animations[0].currentTime)).to.be.greaterThan(0);
    });
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        spin: false,
        rotate: 0,
        strokeWidth: 0,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    );
    cy.get('svg').should('have.css', 'transform', 'none').and('have.attr', 'stroke-width', '0');
    cy.get('svg')
      .should('have.attr', 'stroke-linecap', 'round')
      .and('have.attr', 'stroke-linejoin', 'round');
    cy.get('svg').should(($svg) => {
      expect($svg[0].getAnimations()).to.have.length(0);
      expect($svg[0].style.getPropertyValue('--icon-rotate')).to.equal('');
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ rotate: 180, strokeWidth: 2 }));
    cy.get('svg')
      .should('have.css', 'transform', 'matrix(-1, 0, 0, -1, 0, 0)')
      .and('have.attr', 'stroke-width', '2');
  });
});
