import type { Component } from 'vue';

import { Message } from '@sdata/web-vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/message/*.vue',
);

runDemoTests('message', demos, (demoName) => {
  Message.clear();
  if (demoName === 'type') {
    const messages = [
      '这是一条提示消息！',
      '操作成功！',
      '请注意检查操作内容！',
      '这是一条错误消息！',
      '这是一条普通消息！',
      '这是一条普通消息！',
      '正在加载，请稍候…',
    ];
    messages.forEach((message, index) => {
      cy.get('.sd-btn').eq(index).click();
      cy.get('.sd-message').last().should('contain.text', message);
    });
    return;
  }
  cy.get('.sd-btn').first().click();
  cy.get('.sd-message').should('exist');
});
