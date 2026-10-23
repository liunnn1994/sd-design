import Basic from '../../../../sd-vue-docs/src/components/generated/model-selector/basic.vue';

describe('ModelSelector trigger content', () => {
  it('shows the selected model in the compiled documentation trigger', () => {
    cy.mount(Basic);
    cy.get('.sd-model-selector-trigger').click();
    cy.contains('.sd-model-selector-item:visible', 'Claude Sonnet').click();
    cy.get('.demo-row > span').should('contain.text', 'Claude Sonnet');
    cy.get('.sd-model-selector-trigger .sd-ellipsis-content')
      .first()
      .should('have.text', 'Claude Sonnet');
  });
});
