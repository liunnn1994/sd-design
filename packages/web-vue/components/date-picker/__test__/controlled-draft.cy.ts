import DatePicker, { RangePicker } from '../index';

describe('DatePicker external updates during confirmation', () => {
  for (const clear of [false, true]) {
    it(`${clear ? 'clears' : 'replaces'} a pending single-date selection`, () => {
      const onChange = cy.spy();
      cy.mount(DatePicker, {
        props: { modelValue: '2026-07-05', popupVisible: true, showConfirmBtn: true, onChange },
      });
      cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
      cy.get('.sd-picker input').should('have.value', '2026-07-15');
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ modelValue: clear ? undefined : '2026-08-05' }),
      );
      cy.get('.sd-picker input').should('have.value', clear ? '' : '2026-08-05');
      if (!clear)
        cy.get('.sd-picker-cell[aria-label="2026-08-05"]').should(
          'have.attr',
          'aria-selected',
          'true',
        );
      cy.then(() => expect(onChange.callCount).to.equal(0));
    });

    it(`${clear ? 'clears' : 'replaces'} a pending range selection`, () => {
      const onChange = cy.spy();
      cy.mount(RangePicker, {
        props: {
          modelValue: ['2026-07-05', '2026-08-05'],
          popupVisible: true,
          showConfirmBtn: true,
          onChange,
        },
      });
      cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
      cy.get('.sd-picker input').eq(0).should('have.value', '2026-07-15');
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ modelValue: clear ? [] : ['2026-09-05', '2026-10-05'] }),
      );
      cy.get('.sd-picker input')
        .eq(0)
        .should('have.value', clear ? '' : '2026-09-05');
      cy.get('.sd-picker input')
        .eq(1)
        .should('have.value', clear ? '' : '2026-10-05');
      if (!clear)
        cy.get('.sd-picker-cell[aria-label="2026-09-05"]').should(
          'have.class',
          'sd-picker-cell-range-start',
        );
      cy.then(() => expect(onChange.callCount).to.equal(0));
    });
  }
});
