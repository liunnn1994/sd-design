import ConfigProvider from '../../config-provider';
import zhCN from '../../locale/lang/zh-cn';
import Toolbar from '../index';

const schemas = [{ field: 'name', component: 'input', defaultValue: '', span: 24 }];

// 使用方按旧版类型自建的语言包：不含后来新增的 toolbar / modelSelector 段
const legacyLocale = (() => {
  const { toolbar: _t, modelSelector: _m, ...rest } = zhCN;
  return { ...rest, locale: 'legacy' };
})();

describe('locale fallback for keys added after a consumer built their pack', () => {
  it('falls back to the default pack instead of rendering the raw key', () => {
    cy.mount({
      components: { ConfigProvider, Toolbar },
      setup: () => ({ schemas, locale: legacyLocale }),
      template:
        '<ConfigProvider :locale="locale">' +
        '<Toolbar :schemas="schemas" show-search show-reset />' +
        '</ConfigProvider>',
    });
    // 缺失键不能把 'toolbar.search' 这种原始 key 渲染到界面上
    cy.get('.sd-toolbar-actions').should('not.contain.text', 'toolbar.');
    cy.get('.sd-toolbar-actions .sd-btn').first().should('contain.text', '查询');
    cy.get('.sd-toolbar-actions .sd-btn').last().should('contain.text', '重置');
  });
});
