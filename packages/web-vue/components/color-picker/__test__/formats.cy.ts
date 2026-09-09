import type { ColorFormat } from '../interface';

import ColorPicker from '../index';

const cases: Array<[ColorFormat, string[]]> = [
  ['HEX', ['0000FF']],
  ['HEX8', ['0000FFFF', '100%']],
  ['RGB', ['0', '0', '255']],
  ['RGBA', ['0', '0', '255', '100%']],
  ['HSL', ['240', '100%', '50%']],
  ['HSLA', ['240', '100%', '50%', '100%']],
  ['HSV', ['240', '100%', '100%']],
  ['HSVA', ['240', '100%', '100%', '100%']],
  ['CMYK', ['100%', '100%', '0%', '0%']],
  ['CSS', ['rgb(0, 0, 255)']],
];

describe('ColorPicker format conversion', () => {
  for (const [format, values] of cases) {
    it(`updates ${format} fields after an external color change`, () => {
      cy.mount(ColorPicker, {
        props: { hideTrigger: true, modelValue: '#ff0000', format },
      });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: '#0000ff' }));
      cy.get<HTMLInputElement>('.sd-color-picker-format-input input').should(($inputs) => {
        expect(Array.from($inputs, (input) => input.value)).to.deep.equal(values);
      });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.equal(undefined);
      });
    });
  }

  for (const value of ['hsl(240, 100%, 50%)', 'hsv(240, 100%, 100%)', 'cmyk(100%, 100%, 0%, 0%)']) {
    it(`commits ${value} through the trigger input`, () => {
      cy.mount(ColorPicker, { props: { defaultValue: '#ff0000', format: 'HEX' } });
      cy.get('.sd-color-picker-trigger-input input').clear().type(`${value}{enter}`);
      cy.get('.sd-color-picker-trigger-input input').should('have.value', '#0000FF');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal('#0000FF');
      });
    });
  }
});
