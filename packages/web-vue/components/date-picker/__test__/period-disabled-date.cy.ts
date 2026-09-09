import { MonthPicker, QuarterPicker, RangePicker, YearPicker } from '../index';

describe('DatePicker period date restrictions', () => {
  for (const [mode, value] of [
    ['month', ['2026-07', '2026-08']],
    ['quarter', ['2026-07', '2026-10']],
    ['year', ['2026', '2027']],
  ] as const) {
    it(`accepts a partially enabled ${mode} range`, () => {
      const onChange = cy.spy();
      cy.mount(RangePicker, {
        props: {
          mode,
          hideTrigger: true,
          shortcuts: [{ label: 'Period range', value: [...value] }],
          disabledDate: (date: Date) => date.getDate() === 1,
          onChange,
        },
      });
      cy.contains('.sd-picker-shortcuts button', 'Period range').click();
      cy.then(() => {
        expect(onChange.callCount).to.equal(1);
        expect(onChange.lastCall.args[0]).to.deep.equal([...value]);
      });
    });
  }

  for (const [name, component, cell, expected] of [
    ['month', MonthPicker, '2026-07-01', '2026-07'],
    ['quarter', QuarterPicker, '2026-07-01', '2026-07'],
    ['year', YearPicker, '2026-01-01', '2026'],
  ] as const) {
    for (const allDisabled of [false, true]) {
      it(`${allDisabled ? 'rejects a fully disabled' : 'selects a partially enabled'} ${name}`, () => {
        const onChange = cy.spy();
        cy.mount(component, {
          props: {
            hideTrigger: true,
            defaultPickerValue: '2026-01-01',
            disabledDate: (date: Date) => allDisabled || date.getDate() === 1,
            onChange,
          },
        });
        cy.get(`.sd-picker-cell[aria-label="${cell}"]`)
          .should(($cell) => {
            expect($cell.attr('aria-disabled') === 'true').to.equal(allDisabled);
          })
          .click();
        cy.then(() => Cypress.Promise.delay(0));
        cy.then(() => {
          expect(onChange.callCount).to.equal(allDisabled ? 0 : 1);
          if (!allDisabled) expect(onChange.lastCall.args[0]).to.equal(expected);
        });
      });
    }
  }
});
