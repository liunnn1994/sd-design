import { h } from 'vue';

import ConfigProvider from '../../config-provider';
import enUS from '../../locale/lang/en-us';
import DatePicker, { MonthPicker, RangePicker } from '../index';

describe('DatePicker provider defaults', () => {
  for (const range of [false, true]) {
    it(`uses and updates configured shortcuts for ${range ? 'ranges' : 'dates'}`, () => {
      cy.mount(ConfigProvider, {
        props: {
          datePicker: {
            shortcuts: [
              { label: 'Configured', value: range ? ['2026-07-01', '2026-07-31'] : '2026-07-01' },
            ],
            shortcutsPosition: 'left',
          },
        },
        slots: { default: () => h(range ? RangePicker : DatePicker, { hideTrigger: true }) },
      });
      cy.contains('.sd-picker-shortcuts button', 'Configured').should('be.visible');
      cy.get(range ? '.sd-picker-range-container' : '.sd-picker-container').should(
        'have.class',
        `sd-picker-${range ? 'range-' : ''}container-shortcuts-placement-left`,
      );
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ datePicker: { shortcuts: [], shortcutsPosition: 'right' } }),
      );
      cy.get('.sd-picker-shortcuts').should('not.exist');
    });

    it(`uses the configured first weekday for ${range ? 'ranges' : 'dates'}`, () => {
      cy.mount(ConfigProvider, {
        props: { datePicker: { dayStartOfWeek: 1 } },
        slots: { default: () => h(range ? RangePicker : DatePicker, { hideTrigger: true }) },
      });
      cy.get('.sd-picker-week-list-item').first().should('have.text', '一');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ datePicker: { dayStartOfWeek: 2 } }));
      cy.get('.sd-picker-week-list-item').first().should('have.text', '二');
    });
  }

  it('uses the configured month abbreviation', () => {
    cy.mount(ConfigProvider, {
      props: { locale: enUS, datePicker: { abbreviation: false } },
      slots: {
        default: () => h(MonthPicker, { hideTrigger: true, defaultPickerValue: '2026-01' }),
      },
    });
    cy.get('.sd-panel-month .sd-picker-date-value').first().should('have.text', 'January');
  });

  it('uses the configured now button visibility', () => {
    cy.mount(ConfigProvider, {
      props: { datePicker: { showNowBtn: false } },
      slots: { default: () => h(DatePicker, { hideTrigger: true, showTime: true }) },
    });
    cy.get('.sd-picker-shortcuts button').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ datePicker: { showNowBtn: true } }));
    cy.get('.sd-picker-shortcuts button').should('exist');
  });

  it('keeps explicit local weekday and now button settings ahead of provider defaults', () => {
    cy.mount(ConfigProvider, {
      props: { datePicker: { dayStartOfWeek: 1, showNowBtn: false } },
      slots: {
        default: () =>
          h(DatePicker, {
            hideTrigger: true,
            showTime: true,
            dayStartOfWeek: 0,
            showNowBtn: true,
          }),
      },
    });
    cy.get('.sd-picker-week-list-item').first().should('have.text', '日');
    cy.get('.sd-picker-shortcuts button').should('exist');
  });
});
