import { h } from 'vue';

import TimePicker from '../index';

describe('TimePicker custom trigger', () => {
  it('opens the panel from the trigger slot', () => {
    cy.mount(TimePicker, {
      props: { defaultValue: '09:30:00' },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-trigger' },
            `${scope.displayValue}|${scope.date?.getHours()}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-picker').should('not.exist');
    cy.get('.custom-trigger').should('have.text', '09:30:00|9|false');
    cy.get('.custom-trigger').click();
    cy.get('.custom-trigger').should('have.text', '09:30:00|9|true');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
  });
});
