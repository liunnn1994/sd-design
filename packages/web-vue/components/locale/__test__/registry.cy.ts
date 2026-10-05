import { h } from 'vue';

import { addI18nMessages, getLocale, useI18n, useLocale } from '../index';
import zhCN from '../lang/zh-cn';

describe('Locale registry keys', () => {
  afterEach(() => useLocale('zh-CN'));

  it('ignores unregistered names inherited from Object.prototype', () => {
    useLocale('toString');
    expect(getLocale()).to.equal('zh-CN');
  });

  for (const name of ['constructor', '__proto__']) {
    it(`registers and switches a custom language named ${name}`, () => {
      const lang = { ...zhCN, locale: name, empty: { description: 'Custom language' } };
      addI18nMessages({ [name]: lang });
      useLocale(name);
      cy.mount({
        setup() {
          const { t, locale } = useI18n();
          return () => h('output', `${locale.value}: ${t('empty.description')}`);
        },
      });
      cy.get('output').should('have.text', `${name}: Custom language`);
      cy.then(() => {
        addI18nMessages(
          { [name]: { ...lang, empty: { description: 'Updated language' } } },
          { overwrite: true },
        );
      });
      cy.get('output').should('have.text', `${name}: Updated language`);
    });
  }
});
