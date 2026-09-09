import { h } from 'vue';

import DatePicker, { RangePicker } from '../index';

describe('DatePicker popup lifecycle', () => {
  for (const range of [false, true]) {
    it(`discards the pending ${range ? 'range' : 'date'} when closed and removes its popup on unmount`, () => {
      const onChange = cy.spy();
      const props = {
        defaultPopupVisible: true,
        showConfirmBtn: true,
        unmountOnClose: true,
        onChange,
      };
      cy.mount(
        {
          render: () =>
            h('div', [
              range
                ? h(RangePicker, { ...props, defaultValue: ['2026-07-05', '2026-08-05'] })
                : h(DatePicker, { ...props, defaultValue: '2026-07-05' }),
              h(
                'button',
                { 'data-cy': 'outside', 'style': 'display:block;margin-top:500px' },
                'Outside',
              ),
            ]),
        },
        { global: { stubs: { 'transition': false, 'transition-group': false } } },
      );
      const panel = range ? '.sd-picker-range-container' : '.sd-picker-container';
      cy.get(panel).should('be.visible');
      cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
      cy.get('.sd-picker input').first().should('have.value', '2026-07-15');
      cy.get('[data-cy="outside"]').click();
      cy.get(panel).should('not.exist');
      cy.get('.sd-picker input').first().should('have.value', '2026-07-05').click();
      cy.get(panel).should('be.visible');
      cy.get('.sd-picker input').first().should('have.value', '2026-07-05');
      if (range) cy.get('.sd-picker input').eq(1).should('have.value', '2026-08-05');
      cy.then(() => expect(onChange.callCount).to.equal(0));
      cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
      cy.get(panel).should('not.exist');
    });
  }
});
