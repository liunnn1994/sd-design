import { RangePicker } from '../index';

describe('RangePicker sorted range validation', () => {
  for (const validAfterSorting of [false, true]) {
    it(`${validAfterSorting ? 'accepts' : 'rejects'} a reversed shortcut using its final endpoint roles`, () => {
      const onChange = cy.spy();
      cy.mount(RangePicker, {
        props: {
          hideTrigger: true,
          defaultValue: ['2026-06-01', '2026-09-01'],
          shortcuts: [{ label: 'Reversed range', value: ['2026-08-15', '2026-07-15'] }],
          disabledDate: (date: Date, type: 'start' | 'end') =>
            type === 'start' && (validAfterSorting ? date.getMonth() > 6 : date.getMonth() < 7),
          onChange,
        },
      });
      cy.contains('.sd-picker-shortcuts button', 'Reversed range').click();
      cy.then(() => Cypress.Promise.delay(0));
      cy.then(() => {
        expect(onChange.callCount).to.equal(validAfterSorting ? 1 : 0);
        if (validAfterSorting) {
          expect(onChange.lastCall.args[0]).to.deep.equal(['2026-07-15', '2026-08-15']);
        }
      });
    });
  }
});
