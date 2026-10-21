import { RangePicker } from '../index';

describe('RangePicker foundation clock ordering', () => {
  for (const config of [
    { exchangeTime: true, fixedTime: false, clocks: ['18:00:00', '09:00:00'] },
    { exchangeTime: false, fixedTime: false, clocks: ['09:00:00', '18:00:00'] },
    { exchangeTime: false, fixedTime: true, clocks: ['18:00:00', '09:00:00'] },
  ]) {
    it(`preserves clock rules with exchangeTime=${config.exchangeTime}, fixedTime=${config.fixedTime}`, () => {
      const onChange = cy.spy().as('change');
      cy.mount(RangePicker, {
        props: {
          hideTrigger: true,
          showTime: true,
          exchangeTime: config.exchangeTime,
          fixedTime: config.fixedTime,
          defaultValue: ['2024-02-01 01:00:00', '2024-03-20 02:00:00'],
          shortcuts: [
            { label: 'Reverse clocks', value: ['2024-02-20 09:00:00', '2024-02-01 18:00:00'] },
          ],
          onChange,
        },
      });
      cy.contains('.sd-picker-shortcuts button', 'Reverse clocks').click();
      cy.get('@change').should((spy: ReturnType<typeof cy.spy>) => {
        expect(spy.callCount).to.equal(1);
        expect(spy.firstCall.args[0]).to.deep.equal([
          `2024-02-01 ${config.clocks[0]}`,
          `2024-02-20 ${config.clocks[1]}`,
        ]);
      });
    });
  }
});
