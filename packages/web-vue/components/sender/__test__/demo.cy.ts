import type { Component } from 'vue';

import SenderAgentDemo from '../../../../sd-vue-docs/src/components/generated/sender/agent.vue';
import SenderMethodsDemo from '../../../../sd-vue-docs/src/components/generated/sender/methods.vue';
import SenderPasteFileDemo from '../../../../sd-vue-docs/src/components/generated/sender/paste-file.vue';
import SenderStatesDemo from '../../../../sd-vue-docs/src/components/generated/sender/states.vue';
import SenderSubmitTypeDemo from '../../../../sd-vue-docs/src/components/generated/sender/submit-type.vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/sender/*.vue',
);
const demoSources = import.meta.glob<string>(
  '../../../../sd-vue-docs/src/components/generated/sender/*.vue',
  { eager: true, import: 'default', query: '?raw' },
);

runDemoTests('sender', demos, () => {
  cy.get('.sd-sender').should('exist');
});

describe('<sender> interactive demos:', () => {
  it('uses online-editor-compatible style blocks', () => {
    Object.values(demoSources).forEach((source) => {
      expect(source).not.to.match(/<style\b[^>]*\blang=/);
    });
  });

  it('operates the sender through exposed methods', () => {
    cy.mount(SenderMethodsDemo);

    cy.contains('button', '末尾插入').click();
    cy.get('textarea').should('have.value', '介绍一下 VueUse，并给出示例');
    cy.contains('button', '读取内容').click();
    cy.get('.sd-alert').should('contain.text', '介绍一下 VueUse，并给出示例');
    cy.contains('button', '清空').click();
    cy.get('textarea').should('have.value', '');
  });

  it('demonstrates both submit shortcut modes', () => {
    cy.mount(SenderSubmitTypeDemo);

    cy.get('textarea').eq(0).type('默认模式{enter}');
    cy.get('.sd-alert').should('contain.text', 'Enter 已发送：默认模式');
    cy.get('textarea').eq(1).type('切换模式{shift+enter}');
    cy.get('.sd-alert').should('contain.text', 'Shift + Enter 已发送：切换模式');
  });

  it('shows auto-size, readonly and disabled states', () => {
    cy.mount(SenderStatesDemo);

    cy.get('textarea').eq(0).should('not.be.disabled').and('not.have.attr', 'readonly');
    cy.get('textarea').eq(1).should('have.attr', 'readonly');
    cy.get('textarea').eq(2).should('be.disabled');
    cy.get('.sd-sender').eq(1).trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '内容由系统生成，不可编辑');
  });

  it('lists files pasted into the sender', () => {
    cy.mount(SenderPasteFileDemo);

    cy.get('textarea').then(($textarea) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(['image'], 'diagram.png', { type: 'image/png' }));
      $textarea[0].dispatchEvent(
        new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dataTransfer,
        }),
      );
    });
    cy.get('.sd-sender-header').should('contain.text', 'diagram.png');
    cy.contains('button', '文件 (1)').should('exist');
  });

  it('switches agent configuration and enters the loading workflow', () => {
    cy.mount(SenderAgentDemo);

    cy.contains('button', '代码助手').click();
    cy.get('.sd-sender-skill-tag').should('contain.text', '代码助手');
    cy.get('.sd-sender-slot-select').should('contain.text', 'Vue');
    cy.get('button[aria-label="发送"]').click();
    cy.get('button[aria-label="停止生成"]').should('exist');
    cy.get('.sd-alert').should('contain.text', '正在生成');
    cy.get('button[aria-label="停止生成"]').click();
    cy.get('.sd-alert').should('contain.text', '已停止生成');
  });
});
