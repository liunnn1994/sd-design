import './real-transitions';
import { defineComponent, h, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import { addI18nMessages, useLocale } from '../../locale';
import zhCN from '../../locale/lang/zh-cn';
import Calendar from '../index';

describe('Calendar locale controls', () => {
  afterEach(() => useLocale('zh-CN'));

  it('refreshes controls when ConfigProvider messages change without changing the locale name', () => {
    const locale = ref(zhCN);
    cy.mount(
      defineComponent({
        setup: () => () => h(ConfigProvider, { locale: locale.value }, () => h(Calendar)),
      }),
    );
    cy.get('.sd-calendar__nav--today').should('have.text', '今天');
    cy.then(() => {
      locale.value = { ...zhCN, calendar: { ...zhCN.calendar, today: '回到今天' } };
    });
    cy.get('.sd-calendar__nav--today').should('have.text', '回到今天');
  });

  it('refreshes controls when the active global language pack is overwritten', () => {
    addI18nMessages({ 'calendar-test': { ...zhCN, locale: 'calendar-test' } }, { overwrite: true });
    useLocale('calendar-test');
    cy.mount(Calendar);
    cy.get('.sd-calendar__nav--today').should('have.text', '今天');
    cy.then(() => {
      addI18nMessages(
        {
          'calendar-test': {
            ...zhCN,
            locale: 'calendar-test',
            calendar: { ...zhCN.calendar, today: '返回当天' },
          },
        },
        { overwrite: true },
      );
    });
    cy.get('.sd-calendar__nav--today').should('have.text', '返回当天');
  });

  for (const locale of ['en', 'en-us']) {
    it(`uses English controls with explicit ${locale} locale`, () => {
      cy.mount(Calendar, { props: { viewDate: '2025-01-08', locale } });
      cy.get('.sd-calendar__nav--today').should('have.text', 'Today');
      cy.get('.sd-calendar__view-button').should('contain.text', 'Month');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ locale: 'zh-cn' }));
      cy.get('.sd-calendar__nav--today').should('have.text', '今天');
    });
  }
});
