import { RangePicker } from '../index';

describe('RangePicker panel editability', () => {
  for (const disabledIndex of [0, 1]) {
    it(`preserves endpoint ${disabledIndex} when it is disabled after mount`, () => {
      const onChange = cy.spy();
      cy.mount(RangePicker, {
        props: { hideTrigger: true, defaultValue: ['2026-07-05', '2026-08-05'], onChange },
      });
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ disabled: [disabledIndex === 0, disabledIndex === 1] }),
      );
      cy.get(
        `.sd-picker-cell[aria-label="${disabledIndex === 0 ? '2026-08-15' : '2026-07-15'}"]`,
      ).click();
      cy.then(() => {
        expect(onChange.callCount).to.equal(1);
        expect(onChange.lastCall.args[0]).to.deep.equal(
          disabledIndex === 0 ? ['2026-07-05', '2026-08-15'] : ['2026-07-15', '2026-08-05'],
        );
      });
    });
  }

  for (const state of [
    { disabled: true },
    { disabled: [true, true] },
    { readonly: true },
    { readonly: '不可编辑' },
  ]) {
    it(`blocks range changes for ${JSON.stringify(state)} and supports unlocking`, () => {
      const onChange = cy.spy();
      const onSelect = cy.spy();
      const onShortcut = cy.spy();
      cy.mount(RangePicker, {
        props: {
          ...state,
          'hideTrigger': true,
          'defaultValue': ['2026-07-05', '2026-08-05'],
          'shortcuts': [{ label: 'New range', value: ['2026-07-15', '2026-08-15'] }],
          onChange,
          onSelect,
          'onSelect-shortcut': onShortcut,
        },
      });
      cy.get('.sd-picker-cell[aria-label="2026-07-10"]').click();
      cy.get('.sd-picker-cell[aria-label="2026-08-15"]').click();
      cy.contains('.sd-picker-shortcuts button', 'New range').trigger('mouseenter').click();
      cy.then(() => Cypress.Promise.delay(0));
      cy.then(() => {
        expect(onChange.callCount).to.equal(0);
        expect(onSelect.callCount).to.equal(0);
        expect(onShortcut.callCount).to.equal(0);
      });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false, readonly: false }));
      cy.contains('.sd-picker-shortcuts button', 'New range').click();
      cy.then(() => {
        expect(onChange.callCount).to.equal(1);
        expect(onChange.lastCall.args[0]).to.deep.equal(['2026-07-15', '2026-08-15']);
        expect(onShortcut.callCount).to.equal(1);
      });
    });
  }
});
