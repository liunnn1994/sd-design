import Radio from '../index';

describe('Radio', () => {
  it('should emit change event', () => {
    cy.mount(Radio, { props: { value: 'test' }, slots: { default: 'Label' } });
    cy.get('input').check();
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
    cy.get('input').first().check();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });
});
