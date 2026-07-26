import { getFitWidthCssVar } from '../../_hooks/use-fit-width';
import Input from '../index';

const fitWidthCssVar = getFitWidthCssVar('sd');

describe('Input', () => {
  it('should update value and emit on input', () => {
    cy.mount(Input);
    cy.get('input').type('test');
    cy.get('input').should('have.value', 'test');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('input')).to.have.length(4);
    });
  });

  it('should clear content', () => {
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true } });
    cy.get('input').should('have.value', 'test');
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '');
  });

  it('exposes the clear button with a name and keyboard activation', () => {
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true } });
    cy.get('.sd-input-clear-btn').as('clear');
    cy.get('@clear').should('have.attr', 'role', 'button');
    cy.get('@clear').should('have.attr', 'tabindex', '0');
    cy.get('@clear').should('have.attr', 'aria-label', '清除');
    cy.get('input').should('have.value', 'test');
    cy.get('@clear').trigger('keydown', { key: 'Enter', force: true });
    cy.get('input').should('have.value', '');
  });

  it('fits the measured text and reacts to input changes', () => {
    cy.mount(Input, { props: { defaultValue: 'i', fitWidth: true } });

    cy.get('.sd-input-wrapper').then(($short) => {
      const shortWidth = $short[0].getBoundingClientRect().width;
      expect($short[0].style.getPropertyValue(fitWidthCssVar)).to.match(/px$/);

      cy.get('input').clear().type('a much longer input value');
      cy.get('.sd-input-wrapper').should(($long) => {
        expect($long[0].getBoundingClientRect().width).to.be.greaterThan(shortWidth);
      });
    });
  });

  it('uses the 4ch fallback when value and placeholder are empty', () => {
    cy.mount(Input, { props: { fitWidth: true } });
    cy.get('.sd-input-wrapper').should(($root) => {
      expect($root[0].style.getPropertyValue(fitWidthCssVar)).to.equal('4ch');
    });
  });
});
