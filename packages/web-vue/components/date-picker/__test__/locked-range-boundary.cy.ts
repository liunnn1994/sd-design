import { RangePicker } from '../index';

describe('RangePicker locked endpoint boundaries', () => {
  for (const locked of [0, 1]) {
    for (const shortcut of [false, true]) {
      it(`preserves locked endpoint ${locked} when ${shortcut ? 'a shortcut replaces both dates' : 'the other endpoint crosses it'}`, () => {
        const onChange = cy.spy();
        cy.mount(RangePicker, {
          props: {
            defaultValue: ['2026-07-05', '2026-08-05'],
            disabled: [locked === 0, locked === 1],
            popupVisible: true,
            shortcuts: [{ label: 'Replace both', value: ['2026-07-15', '2026-08-15'] }],
            onChange,
          },
        });
        if (shortcut) cy.contains('.sd-picker-shortcuts button', 'Replace both').click();
        else
          cy.get(`.sd-picker-cell[aria-label="${locked === 0 ? '2026-07-01' : '2026-08-15'}"]`)
            .first()
            .click({ waitForAnimations: false });
        cy.then(() => Cypress.Promise.delay(0));
        cy.get('.sd-picker input')
          .eq(locked)
          .should('have.value', locked === 0 ? '2026-07-05' : '2026-08-05');
        cy.then(() => expect(onChange.callCount).to.equal(0));
      });
    }
  }
});
