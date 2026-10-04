import { defineComponent, h, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import DatePicker, { RangePicker } from '../../date-picker';
import Empty from '../../empty';
import Pagination from '../../pagination';
import TimePicker from '../../time-picker';
import { addI18nMessages, useLocale } from '../index';
import enUS from '../lang/en-us';
import zhCN from '../lang/zh-cn';

const modes = ['date', 'week', 'month', 'year', 'quarter'] as const;

function expectPlaceholders(selector: string, texts: readonly string[]) {
  cy.get(`${selector} input`).should('have.length', texts.length);
  texts.forEach((text, index) => {
    cy.get(`${selector} input`).eq(index).should('have.attr', 'placeholder', text);
  });
}

const Pickers = defineComponent({
  setup() {
    return () =>
      h('div', [
        ...modes.map((mode) => h('div', { class: `range-${mode}` }, [h(RangePicker, { mode })])),
        h('div', { class: 'range-time' }, [h(TimePicker, { type: 'time-range' })]),
        h('div', { class: 'single-date' }, [h(DatePicker)]),
        h('div', { class: 'single-time' }, [h(TimePicker)]),
        h(Empty),
        h(Pagination, { total: 7, showTotal: true }),
      ]);
  },
});

function expectLanguage(lang: typeof zhCN) {
  modes.forEach((mode) =>
    expectPlaceholders(`.range-${mode}`, lang.datePicker.rangePlaceholder[mode]),
  );
  expectPlaceholders('.range-time', lang.datePicker.rangePlaceholder.time);
  expectPlaceholders('.single-date', [lang.datePicker.placeholder.date]);
  expectPlaceholders('.single-time', [lang.datePicker.placeholder.time]);
  cy.get('.sd-empty').should('contain.text', lang.empty.description);
  cy.get('.sd-pagination').should('contain.text', lang.pagination.total.replace('{0}', '7'));
}

describe('Picker i18n', () => {
  beforeEach(() => {
    addI18nMessages({ 'en-US': enUS });
    useLocale('zh-CN');
  });

  afterEach(() => useLocale('zh-CN'));

  it('renders all range placeholders and reacts to global locale changes', () => {
    cy.mount(Pickers);
    expectLanguage(zhCN);
    cy.then(() => useLocale('en-US'));
    expectLanguage(enUS);
    cy.then(() => useLocale('zh-CN'));
    expectLanguage(zhCN);
  });

  it('reacts to ConfigProvider changes and falls back for missing range messages', () => {
    const locale = ref(zhCN);
    cy.mount(
      defineComponent({
        setup: () => () => h(ConfigProvider, { locale: locale.value }, () => h(Pickers)),
      }),
    );
    cy.then(() => {
      locale.value = enUS;
    });
    expectLanguage(enUS);
    cy.then(() => {
      locale.value = {
        ...enUS,
        datePicker: { ...enUS.datePicker, rangePlaceholder: {} },
      } as typeof enUS;
    });
    modes.forEach((mode) =>
      expectPlaceholders(`.range-${mode}`, zhCN.datePicker.rangePlaceholder[mode]),
    );
    expectPlaceholders('.range-time', zhCN.datePicker.rangePlaceholder.time);
    expectPlaceholders('.single-date', [enUS.datePicker.placeholder.date]);
  });

  it('preserves picker locale overrides and explicit placeholders', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h('div', { class: 'local' }, [
              h(RangePicker, {
                locale: { rangePlaceholder: { date: ['Local start', 'Local end'] } },
              }),
            ]),
            h('div', { class: 'custom-date' }, [h(RangePicker, { placeholder: ['From', 'To'] })]),
            h('div', { class: 'custom-time' }, [
              h(TimePicker, { type: 'time-range', placeholder: ['Early', 'Late'] }),
            ]),
          ]),
      }),
    );
    expectPlaceholders('.local', ['Local start', 'Local end']);
    expectPlaceholders('.custom-date', ['From', 'To']);
    expectPlaceholders('.custom-time', ['Early', 'Late']);
  });
});
