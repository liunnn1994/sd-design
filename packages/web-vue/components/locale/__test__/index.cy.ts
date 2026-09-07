import { defineComponent, h } from 'vue';

import { addI18nMessages, getLocale, useLocale, useI18n } from '../index';
import zhCN from '../lang/zh-cn';

const languageModules = import.meta.glob<{ default: typeof zhCN }>([
  '../lang/*.ts',
  '!../lang/kv-list.ts',
]);

function hasEqualStructure(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
  return Object.keys(obj1).every((key) => {
    const v = obj1[key];

    if (typeof v === 'object' && v !== null) {
      if (!obj2[key]) {
        return false;
      }
      return hasEqualStructure(v as Record<string, unknown>, obj2[key] as Record<string, unknown>);
    }

    return Object.prototype.hasOwnProperty.call(obj2, key);
  });
}

const I18nHarness = defineComponent({
  name: 'I18nHarness',
  setup() {
    const { t, locale } = useI18n();

    return () =>
      h('div', { class: 'i18n-harness' }, [
        h('span', { class: 't-interp' }, t('pagination.total', 7)),
        h('span', { class: 't-plain' }, t('empty.description')),
        h('span', { class: 't-missing' }, t('no.such.key')),
        h('span', { class: 't-argless' }, t('pagination.total')),
        h('span', { class: 't-locale' }, locale.value),
      ]);
  },
});

const makeTestLang = (description: string) => ({
  ...zhCN,
  locale: 'test-lang',
  empty: { ...zhCN.empty, description },
});

describe('Locale', () => {
  it('all language files match the zh-cn structure', () => {
    cy.then(async () => {
      const languages = Object.entries(languageModules).filter(
        ([filename]) => !filename.endsWith('/zh-cn.ts'),
      );
      for (const [, loadLanguage] of languages) {
        // oxlint-disable-next-line no-await-in-loop
        const lang = await loadLanguage();
        expect(
          hasEqualStructure(
            lang.default as unknown as Record<string, unknown>,
            zhCN as unknown as Record<string, unknown>,
          ),
        ).to.equal(true);
      }
    });
  });

  it('t() resolves dotted keys and interpolates {0} placeholders', () => {
    cy.mount(I18nHarness);
    cy.get('.t-interp').should('have.text', '共 7 条');
    cy.get('.t-plain').should('have.text', '暂无数据');
    cy.get('.t-locale').should('have.text', 'zh-CN');
  });

  it('t() returns the key itself for missing keys and keeps unresolved placeholders', () => {
    cy.mount(I18nHarness);
    cy.get('.t-missing').should('have.text', 'no.such.key');
    cy.get('.t-argless').should('have.text', '共 {0} 条');
  });

  it('addI18nMessages keeps existing messages without overwrite and replaces with overwrite', () => {
    cy.mount(I18nHarness);
    cy.then(() => {
      addI18nMessages({ 'test-lang': makeTestLang('第一版') });
      useLocale('test-lang');
    });
    cy.get('.t-plain').should('have.text', '第一版');

    cy.then(() => {
      addI18nMessages({ 'test-lang': makeTestLang('第二版') });
    });
    cy.get('.t-plain').should('have.text', '第一版');

    cy.then(() => {
      addI18nMessages({ 'test-lang': makeTestLang('第二版') }, { overwrite: true });
    });
    cy.get('.t-plain').should('have.text', '第二版');

    cy.then(() => {
      useLocale('zh-CN');
    });
    cy.get('.t-locale').should('have.text', 'zh-CN');
  });

  it('useLocale ignores unregistered languages and keeps the current locale', () => {
    cy.mount(I18nHarness);
    cy.then(() => {
      useLocale('missing-lang');
      expect(getLocale()).to.equal('zh-CN');
    });
    cy.get('.t-locale').should('have.text', 'zh-CN');
  });

  it('getLocale returns the current global locale', () => {
    cy.then(() => {
      expect(getLocale()).to.equal('zh-CN');
    });
  });
});
