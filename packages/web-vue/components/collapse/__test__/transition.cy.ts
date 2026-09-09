import Collapse, { CollapseItem } from '../index';

describe('Collapse real transition lifecycle', () => {
  const mount = () =>
    cy.mount(Collapse, {
      props: { destroyOnHide: true, defaultActiveKey: ['one'] },
      global: { components: { CollapseItem }, stubs: { transition: false } },
      slots: {
        default: '<CollapseItem key="one" header="Title"><input value="Initial" /></CollapseItem>',
      },
    });

  it('destroys after leaving and recreates content when reopened', () => {
    mount();
    cy.get('input').clear().type('Edited');
    cy.get('.sd-collapse-item-header').click();
    cy.get('.sd-collapse-item-content-box').should('not.exist');
    cy.get('.sd-collapse-item-header').click();
    cy.get('input').should('be.visible').and('have.value', 'Initial');
  });

  it('preserves content when a leave transition is reversed', () => {
    mount();
    let original: HTMLInputElement;
    cy.get('input').then(($input) => {
      original = $input[0];
    });
    cy.get('.sd-collapse-item-header').then(($header) => {
      $header[0].click();
      return Cypress.Promise.delay(40).then(() => {
        expect(Cypress.$('.collapse-slider-leave-active').length).to.equal(1);
        $header[0].click();
      });
    });
    cy.get('input')
      .should('be.visible')
      .and(($input) => {
        expect($input[0]).to.equal(original);
      });
    cy.get('.collapse-slider-enter-active').should('not.exist');
    cy.get('.sd-collapse-item-content').should(($content) => {
      expect($content[0].style.height).to.equal('auto');
      expect($content[0].getBoundingClientRect().height).to.be.greaterThan(0);
    });
  });
});
