import DatePicker from '../index';

describe('DatePicker panel editability', () => {
  for (const state of [{ disabled: true }, { readonly: true }, { readonly: '不可编辑' }]) {
    it(`prevents confirmation and shortcuts for ${JSON.stringify(state)}`, () => {
      const onChange = cy.spy();
      const onSelect = cy.spy();
      const onOk = cy.spy();
      const onShortcut = cy.spy();
      cy.mount(DatePicker, {
        props: {
          ...state,
          'hideTrigger': true,
          'showConfirmBtn': true,
          'defaultValue': '2026-07-05',
          'shortcuts': [{ label: 'Midmonth', value: '2026-07-15' }],
          onChange,
          onSelect,
          onOk,
          'onSelect-shortcut': onShortcut,
        },
      });
      cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
      cy.get('.sd-picker-btn-confirm').click();
      cy.contains('.sd-picker-shortcuts button', 'Midmonth').trigger('mouseenter').click();
      cy.then(() => Cypress.Promise.delay(0));
      cy.then(() => {
        expect(onChange.callCount).to.equal(0);
        expect(onSelect.callCount).to.equal(0);
        expect(onOk.callCount).to.equal(0);
        expect(onShortcut.callCount).to.equal(0);
      });
      cy.get('.sd-picker-cell[aria-label="2026-07-05"]').should(
        'have.class',
        'sd-picker-cell-selected',
      );
    });

    it(`prevents inline date selection for ${JSON.stringify(state)} and supports unlocking`, () => {
      const onChange = cy.spy().as('change');
      const onSelect = cy.spy().as('select');
      cy.mount(DatePicker, {
        props: {
          ...state,
          hideTrigger: true,
          defaultValue: '2026-07-05',
          defaultPickerValue: '2026-07-05',
          onChange,
          onSelect,
        },
      });
      cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
      cy.then(() => Cypress.Promise.delay(0));
      cy.then(() => {
        expect(onChange.callCount).to.equal(0);
        expect(onSelect.callCount).to.equal(0);
      });
      cy.get('.sd-picker-cell[aria-label="2026-07-05"]').should(
        'have.class',
        'sd-picker-cell-selected',
      );
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false, readonly: false }));
      cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
      cy.get('@change').should('have.been.calledOnce');
      cy.get('.sd-picker-cell[aria-label="2026-07-15"]').should(
        'have.class',
        'sd-picker-cell-selected',
      );
    });
  }
});
