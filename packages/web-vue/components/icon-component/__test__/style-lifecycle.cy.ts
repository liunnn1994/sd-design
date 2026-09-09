import { addFromIconFontCn } from '../add-from-icon-font-cn';
import Icon from '../icon.vue';

describe('Icon and IconFont style lifecycle', () => {
  for (const [name, component] of [
    ['Icon', Icon],
    ['IconFont', addFromIconFontCn({})],
  ] as const) {
    it(`${name} preserves zero size and restores inherited size`, () => {
      cy.mount(component, { props: { size: 24 } });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ size: 0 }));
      cy.get('svg').should('have.css', 'width', '0px');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ size: undefined }));
      cy.get('svg').should(($svg) => {
        expect($svg[0].style.fontSize).to.equal('');
        expect($svg[0].getBoundingClientRect().width).to.be.greaterThan(0);
      });
    });

    it(`${name} composes rotation with the real spin animation`, () => {
      cy.mount(component, { props: { spin: true, rotate: 90 } });
      cy.get('svg').then(($svg) => {
        const animation = $svg[0].getAnimations()[0];
        expect(animation).not.to.equal(undefined);
        animation.pause();
        animation.currentTime = 0;
      });
      cy.get('svg').should('have.css', 'transform', 'matrix(0, 1, -1, 0, 0, 0)');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ spin: false, rotate: 180 }));
      cy.get('svg').should('have.css', 'transform', 'matrix(-1, 0, 0, -1, 0, 0)');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ rotate: 0 }));
      cy.get('svg').should('have.css', 'transform', 'none');
      cy.get('svg').should(($svg) => {
        expect($svg[0].style.getPropertyValue('--icon-rotate')).to.equal('');
        expect($svg[0].getAnimations()).to.have.length(0);
      });
    });
  }
});
