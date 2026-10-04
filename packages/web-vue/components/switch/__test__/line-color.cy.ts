import Switch from '../index';

describe('Switch line colors', () => {
  [false, true].forEach((checked) => {
    it(`keeps the default ${checked ? 'checked' : 'unchecked'} track color when only the opposite color is customized`, () => {
      cy.mount(Switch, {
        props: {
          type: 'line',
          modelValue: checked,
          ...(checked ? { uncheckedColor: '#abcdef' } : { checkedColor: '#abcdef' }),
        },
        attrs: {
          style:
            '--component-switch-switch-color-bg-on: rgb(12, 34, 56); --component-switch-switch-color-bg-off: rgb(12, 34, 56);',
        },
      });
      cy.get('.sd-switch').should(($switch) => {
        expect(getComputedStyle($switch[0], '::after').backgroundColor).to.equal('rgb(12, 34, 56)');
      });
    });
  });
});
