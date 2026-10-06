import ColorPicker from '../index';

describe('ColorPicker input submission', () => {
  it('emits one change when a format field is submitted with Enter', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, defaultValue: 'rgb(255, 0, 0)', format: 'RGB' },
    });
    cy.get('.sd-color-picker-format-input input').first().clear().type('128{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal('rgb(128, 0, 0)');
    });
  });
});
