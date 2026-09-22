import { defineComponent, h } from 'vue';

import ThemeEditor from '../../../../sd-vue-docs/src/components/theme/ThemeEditorPlayground.vue';
import Button from '../../button';
import Input from '../../input';
import ConfigProvider from '../config-provider.vue';
import { normalizeTheme } from '../theme';
import { parseThemeConfig } from '../theme-config';

describe('主题架构与编辑器', () => {
  it('仅覆盖 token 的容器持续跟随祖先明暗变化', () => {
    cy.mount(ConfigProvider, {
      props: { theme: { tokens: { primary6: '1,2,3' } } },
      slots: { default: '跟随主题' },
    });
    cy.get('.sd-theme-provider').should('not.have.attr', 'sd-theme');
    cy.get('.sd-theme-provider').should('have.attr', 'data-sd-theme', 'light');
    cy.document().then((document) => document.body.setAttribute('sd-theme', 'dark'));
    cy.get('.sd-theme-provider').should('have.attr', 'data-sd-theme', 'dark');
    cy.get('.sd-theme-provider').should('not.have.attr', 'sd-theme');
    cy.get('.sd-theme-provider').should(($element) => {
      expect(getComputedStyle($element[0]).getPropertyValue('--sd-color-bg-2').trim()).to.equal(
        '#232324',
      );
    });
    cy.document().then((document) => document.body.removeAttribute('sd-theme'));
    cy.get('.sd-theme-provider').should('have.attr', 'data-sd-theme', 'light');
  });
  it('基础派生、显式覆盖、组件隔离和移除覆盖均改变真实样式', () => {
    const Fixture = defineComponent({
      render: () =>
        h('div', [
          h(
            ConfigProvider,
            {
              theme: {
                seed: { primary: '#ff0000', radius: 12, controlHeight: 40 },
                components: { button: { 'btn-border-radius': '20px' } },
              },
            },
            {
              default: () => [
                h(Button, { type: 'primary', id: 'themed-button' }, () => '主题按钮'),
                h(Input, { id: 'themed-input' }),
              ],
            },
          ),
          h(Button, { type: 'primary', id: 'plain-button' }, () => '默认按钮'),
        ]),
    });
    cy.mount(Fixture);
    cy.get('#themed-button')
      .should('have.css', 'background-color', 'rgb(255, 0, 0)')
      .and('have.css', 'border-radius', '20px')
      .and('have.css', 'height', '40px');
    cy.get('#plain-button').should('not.have.css', 'border-radius', '20px');
    cy.get('#themed-input').should('not.have.css', 'border-radius', '20px');
    expect(
      normalizeTheme({ seed: { primary: '#ff0000' }, tokens: { primary6: '1,2,3' } }).tokens[
        'primary-6'
      ],
    ).to.equal('1,2,3');
  });

  it('严格校验 JSON，保留明暗、紧凑、基础与组件配置', () => {
    for (const value of [
      '[]',
      '{',
      '{"tokens":{"x":true}}',
      '{"seed":{"radius":-1}}',
      '{"algorithm":["unknown"]}',
      '{"meta":{"schemaVersion":2}}',
    ])
      expect(parseThemeConfig(value).valid).to.equal(false);
    const result = parseThemeConfig(
      JSON.stringify({
        algorithm: ['dark', 'compact'],
        seed: { primary: '#123456' },
        tokens: { primary6: '1,2,3' },
        components: { Button: { borderRadius: '9px' } },
      }),
    );
    expect(result.valid).to.equal(true);
    expect(result.data?.components?.button['border-radius']).to.equal('9px');
    expect(result.data?.algorithm).to.deep.equal(['dark', 'compact']);
    expect(parseThemeConfig(JSON.stringify(result.data)).data).to.deep.equal(result.data);
    expect(parseThemeConfig('{}').valid).to.equal(true);
  });

  it('通过基础、高级、组件编辑及 JSON 导入完成主题配置流程', () => {
    cy.viewport(1440, 1000);
    cy.mount(ThemeEditor, { global: { stubs: { transition: false } } });
    cy.get('[data-testid="theme-demo"] .sd-btn-primary').first().should('be.visible');
    cy.get('[data-testid="seed-primary"] input').clear().type('#ff0000').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'background-color', 'rgb(255, 0, 0)');
    cy.contains('button', '高级').click();
    cy.get('[aria-label="主题范围"]').contains('button', '组件').click();
    cy.get('input[aria-label="搜索 token"]').type('btn-border-radius');
    cy.get('input[aria-label="btn-border-radius"]').type('18px').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '18px');
    cy.get('[aria-label="重置 btn-border-radius"]').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('not.have.css', 'border-radius', '18px');
    cy.contains('button', '主题配置').click();
    cy.get('[aria-label="主题 JSON"]')
      .clear()
      .type('{invalid', { parseSpecialCharSequences: false });
    cy.contains('button', '应用配置').click();
    cy.get('[role="alert"]').should('contain.text', 'JSON 解析失败');
    cy.get('[aria-label="主题 JSON"]')
      .clear()
      .type(JSON.stringify({ seed: { primary: '#00ff00' }, algorithm: ['dark', 'compact'] }), {
        parseSpecialCharSequences: false,
      });
    cy.contains('button', '应用配置').click();
    cy.get('[data-testid="theme-demo"]')
      .closest('.sd-theme-provider')
      .should('have.attr', 'sd-theme', 'dark');
    cy.contains('button', '导出').click();
    cy.readFile('cypress/downloads/sd-theme.json').should('deep.include', {
      algorithm: ['dark', 'compact'],
    });
    cy.contains('button', '重置全部').click();
    cy.get('[data-testid="theme-import"] input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(
          JSON.stringify({
            tokens: { primary6: '12,34,56' },
            components: { button: { borderRadius: '16px' } },
          }),
        ),
        fileName: 'import.json',
        mimeType: 'application/json',
      },
      { force: true },
    );
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'background-color', 'rgb(12, 34, 56)')
      .and('have.css', 'border-radius', '16px');
    cy.get('[aria-label="组件主题"]').contains('button', 'input').first().click();
    cy.get('[data-testid="theme-demo"] .sd-input-wrapper').should('exist');
  });
});
