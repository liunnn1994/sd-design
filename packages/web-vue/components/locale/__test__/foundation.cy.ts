import { defineComponent, h, ref } from 'vue';

import coreZhCN from '@sdata/web-core/locale/lang/zh-cn';

import ConfigProvider from '../../config-provider';
import { addI18nMessages, getLocale, useI18n, useLocale } from '../index';
import zhCN from '../lang/zh-cn';

describe('Locale foundation adapter', () => {
  afterEach(() => {
    addI18nMessages({ 'zh-CN': zhCN }, { overwrite: true });
    useLocale('zh-CN');
  });

  it('retains native dictionary identity, provider priority, live registry overwrite and translation arguments', () => {
    expect(zhCN).to.equal(coreZhCN);
    const language = {
      ...zhCN,
      locale: 'fa-native',
      probe: { text: '{0}|{1}', rows: ['zero', 'one'] },
    };
    const providedLanguage = {
      ...language,
      locale: 'provided',
      probe: { text: 'provider', rows: ['scope'] },
    };
    addI18nMessages({ 'fa-native': language });
    useLocale('fa-native');
    const Child = defineComponent({
      setup() {
        const { t, locale } = useI18n();
        return () =>
          h(
            'output',
            { id: 'fa-locale-report' },
            `${locale.value}:${t('probe.text', 0, false)}:${t('probe.rows.01')}`,
          );
      },
    });
    cy.mount(
      defineComponent({
        setup() {
          const provider = ref(false);
          return () =>
            h('div', [
              h(
                'button',
                {
                  id: 'fa-locale-provider',
                  onClick: () => {
                    provider.value = !provider.value;
                  },
                },
                'Toggle provider',
              ),
              provider.value
                ? h(ConfigProvider, { locale: providedLanguage }, () => h(Child))
                : h(Child),
            ]);
        },
      }),
    );
    cy.get('#fa-locale-report').should('have.text', 'fa-native:0|false:one');
    cy.then(() => {
      const updated = { ...language, probe: { text: 'updated', rows: ['new', 'latest'] } };
      addI18nMessages({ 'fa-native': updated }, { overwrite: true });
    });
    cy.get('#fa-locale-report').should('have.text', 'fa-native:updated:latest');
    cy.get('#fa-locale-provider').click();
    cy.get('#fa-locale-report').should('have.text', 'provided:provider:probe.rows.01');
    cy.then(() => expect(getLocale()).to.equal('fa-native'));
    cy.get('#fa-locale-provider').click();
    cy.get('#fa-locale-report').should('have.text', 'fa-native:updated:latest');
  });

  it('uses the live default registry for missing provider keys and preserves raw unknown keys', () => {
    const provider = { ...zhCN, locale: 'legacy', probe: undefined };
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(ConfigProvider, { locale: provider }, () =>
            h(
              defineComponent({
                setup() {
                  const { t } = useI18n();
                  return () =>
                    h(
                      'output',
                      { id: 'fa-fallback-report' },
                      `${t('probe.text')}:${t('unknown.path')}`,
                    );
                },
              }),
            ),
          ),
      }),
    );
    cy.get('#fa-fallback-report').should('have.text', 'probe.text:unknown.path');
    cy.then(() => {
      const fallback = { ...zhCN, probe: { text: 'live fallback' } };
      addI18nMessages({ 'zh-CN': fallback }, { overwrite: true });
    });
    cy.get('#fa-fallback-report').should('have.text', 'live fallback:unknown.path');
  });
});
