import Collapse, { CollapseItem } from '../index';

describe('Collapse dynamic destruction policy', () => {
  it('waits for an ongoing leave before destroying content', () => {
    cy.mount(Collapse, {
      props: { defaultActiveKey: ['one'] },
      global: { components: { CollapseItem }, stubs: { transition: false } },
      slots: { default: '<CollapseItem key="one" header="Title">Body</CollapseItem>' },
    });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.element.querySelector('.sd-collapse-item-header').click();
      return Cypress.Promise.delay(40).then(async () => {
        expect(wrapper.element.querySelector('.collapse-slider-leave-active')).not.to.equal(null);
        await wrapper.setProps({ destroyOnHide: true });
        expect(wrapper.element.querySelector('.sd-collapse-item-content-box')).not.to.equal(null);
      });
    });
    cy.get('.sd-collapse-item-content-box').should('not.exist');
  });

  it('updates hidden content when destroyOnHide changes', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem }, stubs: { transition: false } },
      slots: { default: '<CollapseItem key="one" header="Title">Body</CollapseItem>' },
    });
    cy.get('.sd-collapse-item-content-box').should('exist').and('not.be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ destroyOnHide: true }));
    cy.get('.sd-collapse-item-content-box').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ destroyOnHide: false }));
    cy.get('.sd-collapse-item-content-box').should('exist').and('not.be.visible');
    cy.get('.sd-collapse-item-header').click();
    cy.get('.sd-collapse-item-content-box').should('be.visible').and('have.text', 'Body');
  });
});
