import type { InputMaskPresetName } from '../types';

import InputMask from '../index';

const cases: Array<[InputMaskPresetName, string, string]> = [
  ['mime-type', 'application/json', 'application/json'],
  ['jwt', 'header.payload.signature', 'header.payload.signature'],
  ['fqdn', 'example.com', 'example.com'],
  ['issn', '1234567X', '1234-567X'],
  ['isrc', 'USAAA2612345', 'US-AAA-26-12345'],
  ['iso6346', 'MSCU1234567', 'MSCU 123456 7'],
];

describe('InputMask preset user flows', () => {
  for (const [preset, input, expected] of cases) {
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
