import { RangePicker } from '../index';

describe('RangePicker empty editing draft', () => {
  for (const index of [0, 1]) {
    it(`keeps endpoint ${index} empty while editing without committing the clear`, () => {
      const onChange = cy.spy().as('change');
      cy.mount(RangePicker, {
        props: {
          modelValue: ['2026-11-08', '2026-12-18'],
          popupVisible: true,
          onChange,
        },
      });
      cy.get('.sd-picker input').eq(index).click().clear().should('have.value', '');
      cy.get('.sd-picker input')
        .eq(index ^ 1)
        .should('have.value', index === 0 ? '2026-12-18' : '2026-11-08');
      cy.get('@change').should('not.have.been.called');
      cy.get('.sd-picker input').eq(index).type('2026-11-20{enter}');
      cy.get('@change').should((spy: ReturnType<typeof cy.spy>) => {
        expect(spy.callCount).to.equal(1);
        expect(spy.lastCall.args[0]).to.deep.equal(
          index === 0 ? ['2026-11-20', '2026-12-18'] : ['2026-11-08', '2026-11-20'],
        );
      });
    });
  }
});
