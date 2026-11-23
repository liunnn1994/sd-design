import { inputMaskPresetCases } from '../../../../web-core/tests/fixtures/input-mask-presets';
import InputMask from '../index';

describe('InputMask preset user flows', () => {
  it('preserves the date cursor during continuous rapid input', () => {
    cy.mount(InputMask, { props: { preset: 'date' } });
    cy.get('input').type('20261107', { delay: 0 }).should('have.value', '2026-11-07');
  });

  for (const [preset, input, expected] of inputMaskPresetCases) {
    it(`accepts a complete ${preset} value through typing`, () => {
      cy.mount(InputMask, { props: { preset } });
      cy.get('input').type(input).blur().should('have.value', expected);
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal(expected);
      });
    });
  }

  it('updates formatting and native input mode when the preset changes', () => {
    cy.mount(InputMask, { props: { preset: 'date', modelValue: '20260910' } });
    cy.get('input').should('have.value', '2026-09-10').and('have.attr', 'inputmode', 'numeric');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ preset: 'email', modelValue: 'name@example.com' }),
    );
    cy.get('input').should('have.value', 'name@example.com').and('have.attr', 'inputmode', 'email');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ preset: undefined }));
    cy.get('input').should('not.have.attr', 'data-mask-preset');
    cy.get('input').should('not.have.attr', 'inputmode');
    cy.get('input').type('x').should('have.value', 'name@example.comx');
  });
});
