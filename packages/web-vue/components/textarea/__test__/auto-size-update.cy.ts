import Textarea from '../index';

describe('Textarea auto size updates', () => {
  it('recalculates the height when maxRows changes without input', () => {
    cy.mount(Textarea, {
      props: { defaultValue: 'One\nTwo\nThree\nFour\nFive', autoSize: { maxRows: 5 } },
    });
    cy.get('textarea').should(($textarea) => {
      expect($textarea[0].getBoundingClientRect().height).to.be.greaterThan(100);
    });
    // Let the initial resize notifications settle before changing only the row limit.
    cy.wait(150);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ autoSize: { maxRows: 2 } }));
    cy.get('textarea').should(($textarea) => {
      expect($textarea[0].getBoundingClientRect().height).to.be.lessThan(80);
    });
  });

  it('restores native resizing when autoSize is disabled', () => {
    cy.mount(Textarea, { props: { defaultValue: 'One\nTwo', autoSize: true } });
    cy.get('textarea').should('have.css', 'resize', 'none');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ autoSize: false }));
    cy.get('textarea').should('have.css', 'resize', 'vertical');
  });
});
