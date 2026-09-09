import ColorPicker from '../index';

describe('ColorPicker disabled panel', () => {
  it('keeps the displayed color unchanged when a disabled swatch is clicked', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        disabled: true,
        defaultValue: '#ff0000',
        swatchColors: ['#0000ff'],
      },
    });
    cy.get('.sd-color-picker-format-input input').first().should('have.value', '255');
    cy.get('.sd-color-picker-color-block').then(($button) => $button[0].click());
    cy.get('.sd-color-picker-format-input input').first().should('have.value', '255');
  });

  it('does not add recent colors while disabled', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, disabled: true } });
    cy.get('.sd-color-picker-colors-action').then(($button) => $button[0].click());
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('recent-colors-change')).to.equal(undefined);
    });
    cy.get('.sd-color-picker-color-block').should('not.exist');
  });

  it('does not delete disabled gradient stops from the keyboard', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        disabled: true,
        colorModes: ['linear-gradient'],
        defaultValue:
          'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 255, 0) 50%, rgb(0, 0, 255) 100%)',
      },
    });
    cy.get('.sd-color-picker-gradient-thumb')
      .eq(1)
      .then(($button) => {
        $button[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
      });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
  });
});
