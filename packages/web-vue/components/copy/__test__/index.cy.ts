import Message from '../../message';
import Copy from '../index';

// Real browser clipboard interactions are stubbed, mirroring the vitest spies.
describe('Copy', () => {
  // 失败路径测试中，组件按设计抛错（audit 决策：抛出来暴露失败），
  // async 事件处理器中的 throw 成为 unhandled rejection —— 在对应测试内豁免。
  const ignoreExpectedCopyRejection = () => {
    cy.on('uncaught:exception', (err) => {
      if (String(err && err.message).includes('sdCopy')) {
        return false;
      }
      return undefined;
    });
  };

  beforeEach(() => {
    cy.stub(Message, 'success')
      .returns({ close() {} })
      .as('success');
  });

  it('copies content and shows a success message', () => {
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: true });
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      props: { content: 'https://sd-design.js.org' },
      slots: { default: '复制链接' },
    });
    cy.get('a').click();
    cy.get('@writeText').should('have.been.calledWith', 'https://sd-design.js.org');
    cy.get('@success').should('have.been.calledWith', '复制成功');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.deep.equal([['https://sd-design.js.org']]);
    });
  });

  it('does not copy when the trigger is disabled', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      attrs: { disabled: true },
      props: { content: 'disabled-text' },
      slots: { default: '不可复制' },
    });
    cy.get('a').click({ force: true });
    cy.get('@writeText').should('not.be.called');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.equal(undefined);
    });
  });

  it('forwards the declared disabled prop to the inner trigger', () => {
    cy.mount(Copy, {
      props: { content: 'blocked', component: 'button', disabled: true },
      slots: { default: '不可复制' },
    });
    cy.get('button').should('be.disabled').and('have.attr', 'disabled');

    cy.mount(Copy, {
      props: { content: 'blocked', disabled: true },
      slots: { default: '不可复制' },
    });
    cy.get('a').should('have.class', 'sd-link-disabled').and('not.have.attr', 'href');
  });

  it('does not copy or emit when the content is empty', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      props: { content: '' },
      slots: { default: '空内容' },
    });
    cy.get('a').click({ force: true });
    cy.get('@writeText').should('not.be.called');
    cy.get('@success').should('not.have.been.called');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.equal(undefined);
    });
  });

  it('does not show success or emit copy when the clipboard write fails', () => {
    ignoreExpectedCopyRejection();
    // clipboard API 拒绝且 execCommand 失败时，copy-to-clipboard resolve false，
    // 失败必须向上抛出而不是静默提示复制成功
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: true });
      cy.stub(win.navigator.clipboard, 'writeText').rejects(new Error('denied')).as('writeText');
    });
    cy.document().then((doc) => {
      cy.stub(doc, 'execCommand').returns(false).as('execCommand');
    });
    cy.mount(Copy, {
      props: { content: 'blocked-content' },
      slots: { default: '复制文本' },
    });
    cy.get('a').click();
    cy.get('@writeText').should('have.been.calledWith', 'blocked-content');
    cy.get('@execCommand').should('have.been.calledWith', 'copy');
    cy.get('@success').should('not.have.been.called');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.equal(undefined);
    });
  });

  it('gives the icon-only trigger an accessible name from the tooltip text', () => {
    cy.mount(Copy, { props: { content: 'x', tooltip: '复制链接' } });
    cy.get('a').should('have.attr', 'aria-label', '复制链接');
  });

  it('falls back to execCommand/prompt in a non-secure context', () => {
    ignoreExpectedCopyRejection();
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: false });
      Object.defineProperty(win, 'prompt', {
        configurable: true,
        value: cy.stub().as('prompt'),
      });
    });
    cy.document().then((doc) => {
      cy.stub(doc, 'execCommand').returns(false).as('execCommand');
    });
    cy.mount(Copy, {
      props: { content: 'clipboard-text', clipboardProps: { fallbackToPrompt: true } },
      slots: { default: '复制文本' },
    });
    cy.get('a').click();
    cy.get('@execCommand').should('have.been.calledWith', 'copy');
    cy.get('@prompt').should(
      'have.been.calledWith',
      'Copy to clipboard: Ctrl+C, Enter',
      'clipboard-text',
    );
  });

  it('copies from a button trigger and emits copy', () => {
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: true });
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      props: { content: 'button-content', component: 'button' },
      slots: { default: '复制文本' },
    });
    cy.get('button').click();
    cy.get('@writeText').should('have.been.calledWith', 'button-content');
    cy.get('@success').should('have.been.calledWith', '复制成功');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.deep.equal([['button-content']]);
    });
  });

  it('does not copy when disabled is passed as a prop to a button trigger', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      props: { disabled: true, component: 'button', content: 'blocked' },
      slots: { default: '不可复制' },
    });
    // disabled prop 现在真实转发到 Button，原生 disabled 元素需要 force click
    cy.get('button').click({ force: true });
    cy.get('@writeText').should('not.be.called');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.equal(undefined);
    });
  });

  it('treats an empty-string disabled attribute as disabled', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      attrs: { disabled: '' },
      props: { content: 'blocked' },
      slots: { default: '不可复制' },
    });
    cy.get('a').click({ force: true });
    cy.get('@writeText').should('not.be.called');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('copy')).to.equal(undefined);
    });
  });

  it('applies the inherit class only to the link trigger when textInherit is true', () => {
    cy.mount(Copy, {
      props: { content: 'x', textInherit: false },
      slots: { default: '不继承颜色' },
    });
    cy.get('a').should('have.class', 'sd-copy').and('not.have.class', 'sd-copy-inherit');
  });

  it('does not apply the inherit class to a button trigger', () => {
    cy.mount(Copy, {
      props: { content: 'x', component: 'button' },
      slots: { default: '复制文本' },
    });
    cy.get('button').should('have.class', 'sd-copy').and('not.have.class', 'sd-copy-inherit');
  });

  it('renders the icon slot instead of the default copy icon', () => {
    cy.mount(Copy, {
      props: { content: 'x' },
      slots: { icon: '<span class="custom-icon">C</span>' },
    });
    cy.get('.sd-copy .custom-icon').should('exist');
    cy.get('.sd-copy .sd-icon-copy').should('not.exist');
  });

  it('shows a custom success message after copying', () => {
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: true });
      cy.stub(win.navigator.clipboard, 'writeText').resolves(undefined).as('writeText');
    });
    cy.mount(Copy, {
      props: { content: 'x', successMessage: '已复制到剪贴板' },
      slots: { default: '复制文本' },
    });
    cy.get('a').click();
    cy.get('@writeText').should('have.been.calledWith', 'x');
    cy.get('@success').should('have.been.calledWith', '已复制到剪贴板');
  });

  it('shows the default tooltip text when the tooltip is made visible', () => {
    cy.mount(Copy, {
      props: {
        content: 'x',
        tooltipProps: { defaultPopupVisible: true, renderToBody: false },
      },
      slots: { default: '复制链接' },
    });
    cy.get('.sd-tooltip').should('contain.text', '复制');
  });

  it('lets tooltipProps.content override the tooltip text', () => {
    cy.mount(Copy, {
      props: {
        content: 'x',
        tooltip: '复制',
        tooltipProps: {
          content: '点击复制链接',
          defaultPopupVisible: true,
          renderToBody: false,
        },
      },
      slots: { default: '复制链接' },
    });
    cy.get('.sd-tooltip').should('contain.text', '点击复制链接');
  });

  it('lets a consumer aria-label override the tooltip-derived name', () => {
    cy.mount(Copy, {
      attrs: { 'aria-label': '自定义复制' },
      props: { content: 'x', tooltip: '复制' },
    });
    cy.get('a').should('have.attr', 'aria-label', '自定义复制');
  });

  it('omits aria-label when visible text is provided', () => {
    cy.mount(Copy, {
      props: { content: 'x', tooltip: '复制' },
      slots: { default: '复制链接' },
    });
    cy.get('a').should('not.have.attr', 'aria-label');
  });
});
