describe('React JsonForm root', () => {
  const name = () => cy.get('input[placeholder="请输入Name"]');
  it('uses actual built-in controls and writes the supplied nested model in place', () => {
    cy.visit('/json-form-root.html');
    name().type('Ada');
    cy.get('[role="switch"]').click();
    cy.get('.sd-checkbox').click();
    cy.get('.sd-json-form-row').should('have.class', 'custom-layout');
    cy.contains('button', 'Read model').click();
    cy.get('[data-testid="model"]')
      .should('contain.text', '"name":"Ada"')
      .and('contain.text', '"enabled":true')
      .and('contain.text', '"agree":true')
      .and('contain.text', 'sameUser:true');
    cy.get('[data-testid="events"]').should('not.contain.text', 'root:');
  });
  for (const mode of ['controlled', 'alias']) {
    it(`supports ${mode} model input and publishes field updates before composed schema callbacks`, () => {
      cy.visit(`/json-form-root.html?${mode}`);
      name().type('x');
      cy.get('[data-testid="events"]').should('have.text', 'root:x:true|props:x|event:x');
      cy.contains('button', 'Read model').click();
      cy.get('[data-testid="model"]').should('contain.text', '"name":"x"');
    });
  }
  it('proxies validation/set/reset and preserves nested object identity during imperative updates', () => {
    cy.visit('/json-form-root.html');
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="status"]').should('have.text', 'invalid');
    cy.get('.sd-form-item-message').should('be.visible');
    cy.contains('button', 'Preset').click();
    name().should('have.value', 'Preset');
    cy.contains('button', 'Read model').click();
    cy.get('[data-testid="model"]').should('contain.text', 'sameUser:true');
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="status"]').should('have.text', 'valid');
    cy.contains('button', 'Reset').click();
    name().should('have.value', '');
    cy.contains('button', 'Read model').click();
    cy.get('[data-testid="model"]')
      .should('contain.text', '"name":""')
      .and('contain.text', 'sameUser:true');
  });
  it('mutates controlled models for imperative form actions without publishing field-edit events', () => {
    cy.visit('/json-form-root.html?controlled');
    cy.contains('button', 'Preset').click();
    name().should('have.value', 'Preset');
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.contains('button', 'Reset').click();
    name().should('have.value', '');
  });
  it('uses provider components and handles prototype-name fallback and dynamic hidden fields', () => {
    cy.visit('/json-form-root.html?unknown');
    cy.get('[data-testid="counter"]').click().should('have.text', 'Count:2');
    cy.get('.sd-json-form input').last().type('safe');
    cy.contains('button', 'Read model').click();
    cy.get('[data-testid="model"]')
      .should('contain.text', '"count":2')
      .and('contain.text', '"fallback":"safe"');
    cy.contains('button', 'Hide name').click();
    name().should('not.exist');
    cy.get('[data-testid="hidden"]').should('have.text', 'Hidden:user.name');
  });
  it('translates provider A2UI pointer bindings and keeps chip classes and dynamic labels', () => {
    cy.visit('/json-form-root.html?a2ui');
    cy.get('.sd-json-form').should('have.class', 'sd-json-form--a2ui-0.9.1');
    cy.get('input[placeholder="请输入Pointer"]')
      .should('have.value', 'first')
      .clear()
      .type('second');
    cy.get('.sd-json-form-chips').should('have.class', 'sd-json-form-control--inline');
    cy.contains('.sd-json-form-chips .sd-checkbox', 'One').click();
    cy.contains('button', 'Read model').click();
    cy.get('[data-testid="model"]')
      .should('contain.text', '"a/b":"second"')
      .and('contain.text', '"choices":["one"]');
    cy.contains('button', 'Change label').click();
    cy.get('input[placeholder="请输入Changed pointer"]').should('have.value', 'second');
  });
  it('lets explicit adapter configuration and manual content override provider defaults and schemas', () => {
    cy.visit('/json-form-root.html?local&custom-form&children');
    cy.get('form.custom-form.sd-json-form--default').should('exist');
    cy.get('[data-testid="manual"]').should('have.text', 'Manual form content');
    name().should('not.exist');
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="status"]').should('have.text', 'valid');
  });
  it('adapts scoped schema slots and preserves native React renderer arguments', () => {
    cy.visit('/json-form-root.html?slots');
    cy.get('[data-testid="prefix"]').should('have.text', 'User');
    cy.get('.sd-rate-character-right [data-testid="character"]')
      .should('have.length', 5)
      .first()
      .should('have.text', 'Star 0');
    cy.get('.sd-select-view').click();
    cy.contains('[data-testid="option"]', 'City Rome').click();
    cy.get('[data-testid="selected-label"]').first().should('have.text', 'Selected Rome');
    cy.contains('button', 'Read model').click();
    cy.get('[data-testid="model"]').should('contain.text', '"destination":"rome"');
  });
});
