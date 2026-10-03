import ConfigProvider from '../../config-provider';
import enUS from '../../locale/lang/en-us';
import zhCN from '../../locale/lang/zh-cn';
import Toolbar from '../index';

const schemas = [
  { field: 'name', component: 'input', defaultValue: '', span: 8 },
  { field: 'status', component: 'input', defaultValue: '', span: 8 },
  { field: 'age', component: 'input', defaultValue: '', span: 8 },
];

const mountToolbar = (locale?: typeof zhCN) =>
  cy.mount({
    components: { ConfigProvider, Toolbar },
    setup: () => ({ locale, schemas }),
    template:
      '<ConfigProvider :locale="locale">' +
      '<Toolbar :schemas="schemas" allow-expand show-search show-reset />' +
      '</ConfigProvider>',
  });

describe('Toolbar built-in labels', () => {
  it('renders the Chinese locale text by default', () => {
    mountToolbar();
    cy.get('.sd-toolbar-actions .sd-btn').first().should('contain.text', '查询');
    cy.get('.sd-toolbar-actions .sd-btn').last().should('contain.text', '重置');
  });

  it('follows the configured locale instead of hardcoding Chinese', () => {
    mountToolbar(enUS);
    cy.get('.sd-toolbar-actions .sd-btn').first().should('contain.text', 'Search');
    cy.get('.sd-toolbar-actions .sd-btn').last().should('contain.text', 'Reset');
  });

  it('prefers explicitly passed text over the locale text', () => {
    cy.mount(Toolbar, {
      props: {
        schemas,
        showSearch: true,
        showReset: true,
        searchText: 'GO',
        resetText: 'CLEAR',
      },
    });
    cy.get('.sd-toolbar-actions .sd-btn').first().should('contain.text', 'GO');
    cy.get('.sd-toolbar-actions .sd-btn').last().should('contain.text', 'CLEAR');
  });
});
