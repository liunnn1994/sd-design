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

  it('三步设计保留调整，预设圆角可覆盖，撤销与比较可用', () => {
    cy.viewport(1440, 1024);
    cy.mount(ThemeEditor, { global: { stubs: { transition: false } } });
    cy.get('[data-testid="workspace-page"]').should('be.visible');
    cy.get('.editor-steps [aria-current="step"]').should('contain.text', '选择风格');
    cy.contains('.preset-option', '品牌色').click();
    cy.contains('button', '下一步：调整品牌').click();
    cy.get('.preview-toolbar').contains('组件示例').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary').first().should('be.visible');
    cy.contains('.radius-choice', '微圆').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '4px');
    cy.contains('.brand-colors button', '青色').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'background-color', 'rgb(20, 184, 166)');
    cy.contains('.toolbar-actions button', '撤销').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'background-color', 'rgb(230, 57, 122)');
    cy.contains('.toolbar-actions button', '重做').click();
    cy.contains('.preview-toolbar button', '查看调整前').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'background-color', 'rgb(230, 57, 122)');
    cy.contains('.preview-toolbar button', '返回当前效果').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'background-color', 'rgb(20, 184, 166)');
    cy.get('.editor-steps').contains('.sd-steps-item', '选择风格').click();
    cy.get('.editor-steps').contains('.sd-steps-item', '确认效果').click();
    cy.get('input[aria-label="主题名称"]').clear().type('客户品牌主题').blur();
    cy.contains('button', '下载主题文件').click();
    cy.readFile('cypress/downloads/sd-theme.json').should((config) => {
      expect(config.meta.name).to.equal('客户品牌主题');
      expect(config.seed.primary).to.equal('#14b8a6');
      expect(config.seed.radius).to.equal(4);
      expect(config.tokens).not.to.have.property('border-radius-medium');
    });
    cy.contains('button', '继续调整').click();
    cy.get('[data-testid="seed-primary"] input').should('have.value', '#14B8A6');
    cy.screenshot('theme-guided-brand-desktop');
    cy.viewport(390, 844);
    cy.get('[data-testid="theme-editor"]').should('be.visible');
    cy.document().should((document) =>
      expect(document.documentElement.scrollWidth).to.be.at.most(390),
    );
    cy.screenshot('theme-guided-brand-mobile');
  });

  it('疏密同步控件和间距，深色模式跟随主题文件', () => {
    cy.viewport(1440, 1024);
    cy.mount(ThemeEditor, { global: { stubs: { transition: false } } });
    cy.get('.editor-steps').contains('.sd-steps-item', '调整品牌').click();
    cy.get('.preview-toolbar').contains('组件示例').click();
    cy.get('[aria-label="界面疏密"]').contains('宽松').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'height', '40px');
    cy.get('[aria-label="预览明暗"]').contains('深色').click();
    cy.get('[data-testid="theme-demo"]')
      .closest('.sd-theme-provider')
      .should('have.attr', 'sd-theme', 'dark');
    cy.get('.editor-steps').contains('.sd-steps-item', '确认效果').click();
    cy.contains('button', '下载主题文件').click();
    cy.readFile('cypress/downloads/sd-theme.json').should((config) => {
      expect(config.seed.controlHeight).to.equal(40);
      expect(config.tokens['spacing-7']).to.equal('20px');
      expect(config.algorithm).to.deep.equal(['dark']);
    });
  });

  it('组件微调、JSON 校验与主题文件重新导入', () => {
    cy.viewport(1440, 1024);
    cy.mount(ThemeEditor, { global: { stubs: { transition: false } } });
    cy.get('.editor-steps').contains('.sd-steps-item', '调整品牌').click();
    cy.contains('.sd-collapse-item-header', '微调组件').click();
    cy.get('[aria-label="微调对象"]').click();
    cy.get('[role="option"]').contains('按钮').click();
    cy.get('input[aria-label="搜索 token"]').type('btn-border-radius');
    cy.get('input[aria-label="btn-border-radius"]').type('18px').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '18px');
    cy.contains('button', '恢复跟随整体').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('not.have.css', 'border-radius', '18px');
    cy.contains('.sd-collapse-item-header', '导入与更多选项').click();
    cy.contains('button', '编辑主题文件').click();
    cy.get('[aria-label="主题文件内容"]')
      .clear()
      .type('{invalid', { parseSpecialCharSequences: false });
    cy.contains('button', '应用文件').click();
    cy.get('[role="alert"]').should('contain.text', 'JSON 解析失败');
    cy.get('[aria-label="主题文件内容"]')
      .clear()
      .type(JSON.stringify({ seed: { primary: '#00ff00' }, algorithm: ['dark', 'compact'] }), {
        parseSpecialCharSequences: false,
      });
    cy.contains('button', '应用文件').click();
    cy.get('[data-testid="theme-demo"]')
      .closest('.sd-theme-provider')
      .should('have.attr', 'sd-theme', 'dark');
    cy.contains('button', '恢复默认主题').click();
    cy.get('[data-testid="theme-import"] input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(
          JSON.stringify({
            tokens: { primary6: '12,34,56' },
            components: { button: { 'btn-border-radius': '16px' } },
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
    cy.contains('button', '恢复跟随整体').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('not.have.css', 'border-radius', '16px');
  });
});
