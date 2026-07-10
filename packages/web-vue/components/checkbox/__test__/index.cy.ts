import Checkbox from '../index';

describe('Checkbox', () => {
  it('should emit change event', () => {
    cy.mount(Checkbox, { props: { value: 'test' }, slots: { default: 'Label' } });
    cy.get('.sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('should not be toggleable when disabled', () => {
    cy.mount(Checkbox, { props: { value: 'test', disabled: true } });
    cy.get('input').should('be.disabled');
  });

  it('should emit change event in a group', () => {
    cy.mount(Checkbox.Group, {
      slots: {
        default:
          '<sd-checkbox value="1">Option1</sd-checkbox>' +
          '<sd-checkbox value="2">Option2</sd-checkbox>',
      },
    });
    cy.get('.sd-checkbox').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });
});
