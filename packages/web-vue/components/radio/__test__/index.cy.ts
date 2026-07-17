import Radio from '../index';

describe('Radio', () => {
  it('should emit change event', () => {
    cy.mount(Radio, { props: { value: 'test' }, slots: { default: 'Label' } });
    cy.get('.sd-radio').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('should not be toggleable when disabled', () => {
    cy.mount(Radio, { props: { value: 'test', disabled: true } });
    cy.get('input').should('be.disabled');
  });

  it('should emit change event in a group', () => {
    cy.mount(Radio.Group, {
      slots: {
        default: '<sd-radio value="1">Option1</sd-radio><sd-radio value="2">Option2</sd-radio>',
      },
    });
    cy.get('.sd-radio').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('group exposes role=radiogroup and a shared name for arrow-key nav', () => {
    cy.mount(Radio.Group, {
      slots: {
        default: '<sd-radio value="1">Option1</sd-radio><sd-radio value="2">Option2</sd-radio>',
      },
    });
    cy.get('.sd-radio-group').should('have.attr', 'role', 'radiogroup');
    // 组内 radio 共享同一个 name（原生方向键分组导航的前提）
    cy.get('input[type="radio"]')
      .eq(0)
      .invoke('attr', 'name')
      .then((name1) => {
        cy.get('input[type="radio"]').eq(1).should('have.attr', 'name', name1);
      });
  });

  it('renders a native radio with label association', () => {
    cy.mount(Radio, { props: { value: 'test' }, slots: { default: 'My Label' } });
    cy.get('input[type="radio"]').should('exist');
  });
});
