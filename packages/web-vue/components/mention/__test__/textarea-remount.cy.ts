import Mention from '../index';

describe('Mention textarea remount', () => {
  it('measures the current textarea after switching input types', () => {
    cy.mount(Mention, { props: { type: 'textarea', data: ['Alice'] } });
    cy.get('textarea').type('@');
    cy.get('.sd-mention-measure').should('have.css', 'font-size', '14px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ type: 'input' }));
    cy.get('input').should('exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ type: 'textarea' }));
    cy.get('textarea').clear().type('@');
    cy.get('.sd-mention-measure').should(($mirror) => {
      const textarea = $mirror[0].parentElement!.querySelector('textarea')!;
      expect($mirror[0].style.width).to.equal(getComputedStyle(textarea).width);
      expect($mirror[0].style.fontSize).to.equal(getComputedStyle(textarea).fontSize);
    });
  });
});
