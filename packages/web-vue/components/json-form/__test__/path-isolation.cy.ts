import JsonForm, { type JsonFormInstance } from '../index';

describe('JsonForm path isolation', () => {
  afterEach(() => {
    Reflect.deleteProperty(Object.prototype, '__jsonFormAuditValue__');
  });

  it('does not write through a prototype path while editing', () => {
    cy.mount(JsonForm, {
      props: { model: {}, schemas: [{ field: '__proto__.__jsonFormAuditValue__', type: 'input' }] },
    });
    cy.get('input').type('x');
    cy.then(() => {
      expect(Object.prototype).not.to.have.own.property('__jsonFormAuditValue__');
    });
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as JsonFormInstance).resetFields());
    cy.then(() => {
      expect(Object.prototype).not.to.have.own.property('__jsonFormAuditValue__');
    });
  });
});
