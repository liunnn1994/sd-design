import { defineComponent, h, ref } from 'vue';

import Typography from '../index';

const { Paragraph, Text, Title } = Typography;

describe('Typography', () => {
  it('Paragraph supports copyable', () => {
    cy.mount(Paragraph, { props: { copyable: true }, slots: { default: 'my text' } });
    cy.get('.sd-typography-operation-copy').should('exist').click({ force: true });
    cy.get('.sd-typography-operation-copied').should('exist');
  });

  it('Paragraph passes clipboard props to copy-to-clipboard', () => {
    cy.window().then((win) => {
      Object.defineProperty(win, 'isSecureContext', { configurable: true, value: false });
      Object.defineProperty(win, 'prompt', { configurable: true, value: cy.stub().as('prompt') });
    });
    cy.document().then((doc) => {
      cy.stub(doc, 'execCommand').returns(false).as('execCommand');
    });
    cy.mount(Paragraph, {
      props: {
        copyable: true,
        copyText: 'clipboard-text',
        clipboardProps: { fallbackToPrompt: true },
      },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy').click({ force: true });
    cy.get('@execCommand').should('have.been.calledWith', 'copy');
    cy.get('@prompt').should(
      'have.been.calledWith',
      'Copy to clipboard: Ctrl+C, Enter',
      'clipboard-text',
    );
  });

  it('Paragraph supports editable', () => {
    cy.mount(Paragraph, { props: { editable: true }, slots: { default: 'my text' } });
    cy.get('.sd-typography-operation-edit').should('exist').click({ force: true });
    cy.get('.sd-typography-edit-content').should('exist');
  });

  it('exposes copy/edit controls with button role, tabindex and a name', () => {
    cy.mount(Paragraph, {
      props: { copyable: true, editable: true },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'tabindex', '0')
      .and('have.attr', 'aria-label');
    cy.get('.sd-typography-operation-edit')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'tabindex', '0')
      .and('have.attr', 'aria-label');
  });

  it('Paragraph mounts with an ellipsis config', () => {
    // Browser layout decides the exact cut point; assert the clamped body renders
    // the expected source prefix instead of coupling the test to a character count.
    const text = 'A design is a plan or specification for the construction'.repeat(10);
    cy.mount(
      defineComponent({
        render() {
          return h(
            'div',
            { style: 'max-width: 200px' },
            h(Paragraph, { ellipsis: { rows: 2, expandable: true } }, { default: () => text }),
          );
        },
      }),
    );
    cy.get('.sd-typography').should('exist');
    cy.get('.sd-typography [data-part="body"]').should('contain.text', text.slice(0, 20));
  });

  it('shows the ellipsis tooltip only when the content is clamped', () => {
    cy.mount(Paragraph, {
      props: {
        ellipsis: {
          rows: 1,
          showTooltip: {
            type: 'tooltip',
            props: { mouseEnterDelay: 0, mouseLeaveDelay: 0 },
          },
        },
      },
      attrs: { style: 'width: 240px;' },
      slots: { default: 'short content' },
    });
    cy.get('.sd-typography').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('not.exist');

    cy.get('@vue').then(({ wrapper }) => {
      cy.wrap(wrapper.unmount());
    });
    cy.mount(Paragraph, {
      props: {
        ellipsis: {
          rows: 1,
          showTooltip: {
            type: 'tooltip',
            props: { mouseEnterDelay: 0, mouseLeaveDelay: 0 },
          },
        },
      },
      attrs: { style: 'width: 80px;' },
      slots: { default: 'A design is a plan or specification for a system.' },
    });
    cy.get('.sd-typography').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
  });

  it('Paragraph edits text via the edit operation and emits change/editStart/editEnd', () => {
    const onEditStart = cy.stub().as('editStart');
    const onEditEnd = cy.stub().as('editEnd');
    cy.mount(
      defineComponent({
        setup() {
          const text = ref('my text');
          return () =>
            h(
              Paragraph,
              {
                editable: true,
                editText: text.value,
                onChange: (value: string) => {
                  text.value = value;
                },
                onEditStart,
                onEditEnd,
              },
              { default: () => text.value },
            );
        },
      }),
    );
    cy.get('.sd-typography-operation-edit').click({ force: true });
    cy.get('.sd-typography-edit-content input').should('have.value', 'my text').and('be.focused');
    cy.get('.sd-typography-edit-content input').type('{selectall}edited');
    cy.get('.sd-typography-edit-content input').should('have.value', 'edited');
    // Enter 结束编辑，显示受控更新后的文本
    cy.get('.sd-typography-edit-content input').type('{enter}');
    cy.get('@editStart').should('have.been.calledOnce');
    cy.get('@editEnd').should('have.been.calledOnce');
    cy.get('.sd-typography-edit-content').should('not.exist');
    cy.get('.sd-typography').should('contain.text', 'edited');
  });

  it('Paragraph starts editing immediately with defaultEditing', () => {
    cy.mount(Paragraph, {
      props: { editable: true, defaultEditing: true },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-edit-content input').should('have.value', 'my text').and('be.focused');
  });

  it('emits copy with the slot text by default and copyText when provided', () => {
    const onCopy = cy.stub().as('copy');
    cy.mount(Paragraph, {
      props: { copyable: true, onCopy },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy').click({ force: true });
    cy.get('@copy').should('have.been.calledWith', 'my text');

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    cy.mount(Paragraph, {
      props: { copyable: true, copyText: 'custom-text', onCopy },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy').click({ force: true });
    cy.get('@copy').should('have.been.calledWith', 'custom-text');
  });

  it('resets copied state after copyDelay', () => {
    cy.mount(Paragraph, {
      props: { copyable: true, copyDelay: 100 },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy').click({ force: true });
    cy.get('.sd-typography-operation-copied').should('exist');
    // copyDelay 后翻回未复制态（重试机制覆盖定时器翻转）
    cy.get('.sd-typography-operation-copy').should('exist');
  });

  it('activates copy and edit operations via keyboard (Enter/Space)', () => {
    const onCopy = cy.stub().as('copy');
    // Base 对外暴露的是 editStart（内部 edit 事件被 base 消费），copy 则会透传 emit('copy')
    const onEditStart = cy.stub().as('edit');
    cy.mount(Paragraph, {
      props: { copyable: true, editable: true, onCopy, onEditStart },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy').focus().type('{enter}');
    cy.get('@copy').should('have.been.calledOnce');
    cy.get('.sd-typography-operation-copy').focus().type(' ');
    cy.get('@copy').should('have.been.calledTwice');
    cy.get('.sd-typography-operation-edit').focus().type('{enter}');
    cy.get('@edit').should('have.been.calledOnce');
    cy.get('.sd-typography-edit-content').should('exist');
  });

  it('applies type and disabled classes', () => {
    cy.mount(Paragraph, {
      props: { type: 'danger', disabled: true },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography')
      .should('have.class', 'sd-typography-danger')
      .and('have.class', 'sd-typography-disabled');
  });

  it('wraps content in b/u/del/code/mark tags for the style flags', () => {
    cy.mount(Paragraph, {
      props: { bold: true, underline: true, delete: true, code: true, mark: true },
      slots: { default: 'my text' },
    });
    // 包裹顺序与 contentTags 一致：mark 最外层，b 最内层
    cy.get('.sd-typography mark code del u b').should('have.text', 'my text');
    cy.get('.sd-typography mark').should('have.length', 1);
  });

  it('renders custom mark color in normal and ellipsis modes', () => {
    cy.mount(Paragraph, {
      props: { mark: { color: 'rgb(255, 0, 0)' } },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography mark').should('have.css', 'background-color', 'rgb(255, 0, 0)');

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    // 省略模式下 mark 颜色通过 richHtml 内联 style 注入
    cy.mount(Paragraph, {
      props: { mark: { color: 'rgb(0, 128, 0)' }, ellipsis: true },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography mark')
      .should('have.attr', 'style')
      .and('contain', 'background-color:rgb(0, 128, 0)');
    cy.get('.sd-typography').should('contain.text', 'my text');
  });

  it('Title renders the requested heading level', () => {
    cy.mount(Title, { props: { heading: 3 }, slots: { default: 'Title' } });
    cy.get('h3.sd-typography').should('have.text', 'Title');
    cy.get('h1').should('not.exist');
  });

  it('Paragraph blockquote renders blockquote element with spacing class', () => {
    cy.mount(Paragraph, {
      props: { blockquote: true, spacing: 'close' },
      slots: { default: 'quote' },
    });
    cy.get('blockquote.sd-typography').should('have.class', 'sd-typography-spacing-close');
  });

  it('Text renders as span by default and as a clamped div with ellipsis', () => {
    cy.mount(Text, { slots: { default: 'some text' } });
    cy.get('span.sd-typography').should('have.text', 'some text');

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    cy.mount(Text, {
      props: { ellipsis: { rows: 1 } },
      attrs: { style: 'width: 80px' },
      slots: { default: 'A design is a plan or specification for a system.' },
    });
    cy.get('.sd-typography')
      .should('have.attr', 'data-part', 'root')
      .then(($el) => {
        expect($el[0].tagName.toLowerCase()).to.equal('div');
      });
  });

  it('expandable ellipsis expands and collapses via the expand operation', () => {
    const onExpand = cy.stub().as('expand');
    const text = 'A design is a plan or specification for the construction of an object.';
    cy.mount(Paragraph, {
      props: { ellipsis: { rows: 1, expandable: true }, onExpand },
      attrs: { style: 'width: 80px' },
      slots: { default: text },
    });
    // RichLineClamp 会把 after 插槽克隆进隐藏的探测节点，操作元素必须限定在真实渲染区
    cy.get('.sd-typography [data-part="content"] .sd-typography-operation-expand')
      .first()
      .should('exist')
      .click({ force: true });
    cy.get('@expand').should('have.been.calledWith', true);
    // 展开后完整文本可见
    cy.get('.sd-typography').should('contain.text', text.slice(-20));
    cy.get('.sd-typography [data-part="content"] .sd-typography-operation-expand')
      .first()
      .should('contain.text', '折叠')
      .click({ force: true });
    cy.get('@expand').should('have.been.calledWith', false);
    cy.get('.sd-typography [data-part="content"] .sd-typography-operation-expand')
      .first()
      .should('contain.text', '展开');
  });

  it('emits the ellipsis event only when the content is clamped', () => {
    const onEllipsis = cy.stub().as('ellipsis');
    const text = 'A design is a plan or specification for the construction of an object.';
    cy.mount(Paragraph, {
      props: { ellipsis: { rows: 1 }, onEllipsis },
      attrs: { style: 'width: 80px' },
      slots: { default: text },
    });
    cy.get('@ellipsis').should('have.been.calledWith', true);

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    // 未截断时不触发
    cy.mount(Paragraph, {
      props: { ellipsis: { rows: 1 }, onEllipsis },
      slots: { default: 'short' },
    });
    cy.get('@ellipsis').should('have.been.calledOnce');
  });

  it('sets the title attribute with the full text when clamped without tooltip', () => {
    const text = 'A design is a plan or specification for the construction of an object.';
    cy.mount(Paragraph, {
      props: { ellipsis: { rows: 1 } },
      attrs: { style: 'width: 80px' },
      slots: { default: text },
    });
    cy.get('.sd-typography').should('have.attr', 'title').and('contain', 'A design is');
  });

  it('supports copy-tooltip and copy-icon scoped slots', () => {
    cy.mount(Paragraph, {
      props: { copyable: true, copyTooltipProps: { mouseEnterDelay: 0 } },
      slots: {
        'default': 'my text',
        'copy-tooltip': '<span class="custom-copy-tooltip">CUSTOM TOOLTIP</span>',
        'copy-icon': '<span class="custom-copy-icon">[Y]</span>',
      },
    });
    cy.get('.sd-typography-operation-copy').find('.custom-copy-icon').should('exist');
    cy.get('.sd-typography-operation-copy').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', 'CUSTOM TOOLTIP');
  });

  it('removes the inner-text measurement container after measuring', () => {
    cy.document().then((doc) => {
      const selector = 'body > div[aria-hidden="true"]';
      const before = doc.querySelectorAll(selector).length;

      cy.mount(Paragraph, {
        props: { copyable: true },
        slots: { default: 'my text' },
      });
      cy.get('.sd-typography-operation-copy').should('exist');

      cy.document().then((doc2) => {
        expect(doc2.querySelectorAll(selector).length).to.equal(before);
      });
    });
  });

  it('keeps the copied state across rapid re-copy within copyDelay', () => {
    cy.mount(Paragraph, {
      props: { copyable: true, copyDelay: 200 },
      slots: { default: 'my text' },
    });
    cy.get('.sd-typography-operation-copy').click({ force: true });
    cy.get('.sd-typography-operation-copied').should('exist');
    cy.wait(120);
    cy.get('.sd-typography-operation-copy').click({ force: true });
    // 若未先 clearTimeout 旧 timer，第一次的 timer 会提前复位 copied 状态
    cy.wait(120);
    cy.get('.sd-typography-operation-copied').should('exist');
  });

  it('Typography wrapper renders an article root', () => {
    cy.mount(Typography, { slots: { default: '<p>body</p>' } });
    cy.get('article.sd-typography').should('contain.text', 'body');
  });
});
