import ColorPicker from '../index';

describe('ColorPicker readonly inline panel', () => {
  for (const readonly of [true, 'Locked color']) {
    it(`preserves color and recent colors with readonly=${readonly}`, () => {
      cy.mount(ColorPicker, {
        props: {
          hideTrigger: true,
          readonly,
          defaultValue: '#ff0000',
          swatchColors: ['#0000ff'],
        },
      });
      cy.get('.sd-color-picker-color-block').then(($button) => $button[0].click());
      cy.get('.sd-color-picker-colors-action').then(($button) => $button[0].click());
      cy.get('.sd-color-picker-format-input input').first().should('have.value', '255');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.equal(undefined);
        expect(wrapper.emitted('recent-colors-change')).to.equal(undefined);
      });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ readonly: false }));
      cy.get('.sd-color-picker-color-block').click();
      cy.get('.sd-color-picker-format-input input').first().should('have.value', '0');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')?.[0]?.[0]).to.equal('rgb(0, 0, 255)');
      });
    });
  }
});
