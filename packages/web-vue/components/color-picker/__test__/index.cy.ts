import ColorPicker from '../index';

const gradientValue = 'linear-gradient(45deg, rgba(79, 172, 254, 1) 0%, rgba(0, 242, 254, 1) 100%)';

describe('ColorPicker', () => {
  it('renders the size class', () => {
    cy.mount(ColorPicker, { props: { size: 'mini' } });
    cy.get('.sd-color-picker').should('have.class', 'sd-color-picker-size-mini');
  });

  it('renders the disabled class', () => {
    cy.mount(ColorPicker, { props: { disabled: true } });
    cy.get('.sd-color-picker').should('have.class', 'sd-color-picker-disabled');
  });

  it('bridges panel changes via an onChange handler on the Panel', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, format: 'RGBA', enableAlpha: true },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const panel = wrapper.findComponent({ name: 'Panel' });
      expect(panel.exists()).to.equal(true);
      expect(typeof panel.props('onChange')).to.equal('function');
    });
  });

  it('renders the gradient mode panel', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        colorModes: ['monochrome', 'linear-gradient'],
        modelValue: gradientValue,
      },
    });
    cy.get('.sd-color-picker-gradient-panel').should('exist');
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
  });

  it('adds a recent color from the current selection', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        recentColors: [],
        modelValue: gradientValue,
        colorModes: ['linear-gradient'],
      },
    });
    cy.get('.sd-color-picker-colors-action').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('recent-colors-change')?.[0]?.[0]).to.deep.equal([
        'linear-gradient(45deg, rgb(79, 172, 254) 0%, rgb(0, 242, 254) 100%)',
      ]);
    });
  });

  it('adds a gradient stop when multiple gradient is enabled', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        enableMultipleGradient: true,
        colorModes: ['linear-gradient'],
        modelValue: gradientValue,
      },
    });
    cy.get('.sd-color-picker-gradient-bar').click('topRight');
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
  });

  it('does not add a gradient stop when multiple gradient is disabled', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        enableMultipleGradient: false,
        colorModes: ['linear-gradient'],
        modelValue: gradientValue,
      },
    });
    cy.get('.sd-color-picker-gradient-bar').click('topRight');
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
  });

  it('opens the panel and exposes the format select', () => {
    cy.mount(ColorPicker, {
      props: { format: 'HEX', enableAlpha: true },
    });
    cy.get('.sd-color-picker').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
    cy.get('.sd-select-view').should('exist');
  });
});
