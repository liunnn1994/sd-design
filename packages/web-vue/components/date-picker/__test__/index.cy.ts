import { h } from 'vue';

import DatePicker, { RangePicker } from '../index';

describe('DatePicker custom trigger', () => {
  it('opens DatePicker from the named trigger slot', () => {
    cy.mount(DatePicker, {
      props: { defaultValue: '2026-07-28' },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-date-trigger' },
            `${scope.displayValue}|${scope.date?.getFullYear()}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-picker').should('not.exist');
    cy.get('.custom-date-trigger').should('have.text', '2026-07-28|2026|false');
    cy.get('.custom-date-trigger').click();
    cy.get('.custom-date-trigger').should('have.text', '2026-07-28|2026|true');
    cy.get('.sd-picker-container').should('be.visible');
  });

  it('opens RangePicker from the named trigger slot', () => {
    cy.mount(RangePicker, {
      props: { defaultValue: ['2026-07-01', '2026-07-28'] },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-range-trigger' },
            `${scope.displayValue.join('~')}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-picker').should('not.exist');
    cy.get('.custom-range-trigger').should('have.text', '2026-07-01~2026-07-28|false');
    cy.get('.custom-range-trigger').click();
    cy.get('.custom-range-trigger').should('have.text', '2026-07-01~2026-07-28|true');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
  });

  it('keeps the default slot as a compatible trigger', () => {
    cy.mount(DatePicker, {
      slots: {
        default: () => h('button', { class: 'legacy-trigger' }, '兼容触发器'),
      },
    });
    cy.get('.legacy-trigger').click();
    cy.get('.sd-picker-container').should('be.visible');
  });
});
