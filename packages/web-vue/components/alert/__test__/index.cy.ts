import Alert from '../index';

describe('Alert', () => {
  it('should emit close event', () => {
    cy.mount(Alert, { props: { closable: true } });
    cy.get('.sd-alert-close-btn').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('should apply type classes reactively', () => {
    cy.mount(Alert, { props: { type: 'info' } });
    cy.get('.sd-alert-info').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ type: 'success' })));
    cy.get('.sd-alert-success').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ type: 'warning' })));
    cy.get('.sd-alert-warning').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ type: 'error' })));
    cy.get('.sd-alert-error').should('exist');
  });

  it('exposes role=alert, aria-hidden icon, and a keyboard-operable close button', () => {
    cy.mount(Alert, { props: { closable: true, type: 'info' } });
    cy.get('.sd-alert').should('have.attr', 'role', 'alert');
    cy.get('.sd-alert-icon').should('have.attr', 'aria-hidden', 'true');
    // 关闭按钮键盘可达：tabindex=0，Enter 触发关闭
    cy.get('.sd-alert-close-btn').should('have.attr', 'tabindex', '0');
    cy.get('.sd-alert-close-btn').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('renders title prop and default slot content with the with-title class', () => {
    cy.mount(Alert, {
      props: { title: 'Tip' },
      slots: { default: 'Some content' },
    });
    cy.get('.sd-alert-title').should('contain.text', 'Tip');
    cy.get('.sd-alert-content').should('contain.text', 'Some content');
    sdAlert().should('have.class', 'sd-alert-with-title');
  });

  it('renders the title slot instead of the title prop and applies with-title', () => {
    cy.mount(Alert, { slots: { title: '<span class="custom-title">Slot title</span>' } });
    cy.get('.sd-alert-title .custom-title').should('contain.text', 'Slot title');
    sdAlert().should('have.class', 'sd-alert-with-title');
  });

  it('hides the icon when showIcon is false', () => {
    cy.mount(Alert, { props: { showIcon: false } });
    cy.get('.sd-alert-icon').should('not.exist');
  });

  it('renders no icon for type normal', () => {
    cy.mount(Alert, { props: { type: 'normal' } });
    // type=normal 且无自定义 icon 插槽时不渲染图标区
    cy.get('.sd-alert-icon').should('not.exist');
  });

  it('renders a custom icon slot for type normal', () => {
    cy.mount(Alert, {
      props: { type: 'normal' },
      slots: { icon: '<span class="custom-icon">i</span>' },
    });
    cy.get('.sd-alert-icon .custom-icon').should('contain.text', 'i');
  });

  it('overrides the default type icon via the icon slot', () => {
    cy.mount(Alert, {
      props: { type: 'error' },
      slots: { icon: '<span class="custom-icon">!</span>' },
    });
    cy.get('.sd-alert-icon .custom-icon').should('contain.text', '!');
  });

  it('renders the action slot in its own container', () => {
    cy.mount(Alert, { slots: { action: '<button class="custom-action">Retry</button>' } });
    cy.get('.sd-alert-action .custom-action').should('contain.text', 'Retry');
  });

  it('does not render the action container without the action slot', () => {
    cy.mount(Alert);
    cy.get('.sd-alert-action').should('not.exist');
  });

  it('applies banner and center modifier classes reactively', () => {
    cy.mount(Alert, { props: { banner: true, center: true } });
    sdAlert().should('have.class', 'sd-alert-banner').and('have.class', 'sd-alert-center');
    cy.get('@vue')
      .then(({ wrapper }) => cy.wrap(wrapper.setProps({ banner: false, center: false })))
      .then(() => {
        sdAlert().should('not.have.class', 'sd-alert-banner');
        sdAlert().should('not.have.class', 'sd-alert-center');
      });
  });

  it('does not render a close button by default', () => {
    cy.mount(Alert);
    cy.get('.sd-alert-close-btn').should('not.exist');
  });

  it('supports the close-element slot while keeping keyboard operability', () => {
    cy.mount(Alert, {
      props: { closable: true },
      slots: { 'close-element': '<span class="custom-close">X</span>' },
    });
    cy.get('.sd-alert-close-btn .custom-close').should('contain.text', 'X');
    cy.get('.sd-alert-close-btn').should('have.attr', 'role', 'button');
    cy.get('.sd-alert-close-btn').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('emits close and removes the element after the leave animation', () => {
    const events: string[] = [];
    cy.mount(Alert, {
      props: {
        closable: true,
        onClose: () => events.push('close'),
        onAfterClose: () => events.push('afterClose'),
      },
      global: { stubs: { transition: false } },
    });
    cy.get('.sd-alert-close-btn').click();
    cy.get('.sd-alert').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
      expect(wrapper.emitted('afterClose')).to.have.length(1);
      expect(events).to.deep.equal(['close', 'afterClose']);
    });
  });

  it('ignores unrelated keys and reacts to closable updates', () => {
    cy.mount(Alert, { props: { closable: true } });
    cy.get('.sd-alert-close-btn').focus().trigger('keydown', { key: 'Escape' });
    sdAlert().should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.equal(undefined);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ closable: false })));
    cy.get('.sd-alert-close-btn').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ closable: true })));
    cy.get('.sd-alert-close-btn').click();
    sdAlert().should('not.exist');
  });

  it('updates title and icon visibility without remounting', () => {
    cy.mount(Alert, { props: { title: 'Initial', type: 'info' } });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ title: '', type: 'normal' })));
    cy.get('.sd-alert-title').should('not.exist');
    sdAlert().should('not.have.class', 'sd-alert-with-title');
    cy.get('.sd-alert-icon').should('not.exist');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ title: 'Updated', type: 'success', showIcon: false })),
    );
    cy.get('.sd-alert-title').should('have.text', 'Updated');
    cy.get('.sd-alert-icon').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ showIcon: true })));
    cy.get('.sd-alert-icon').should('be.visible');
  });

  it('closes via the Space key on the close button', () => {
    cy.mount(Alert, { props: { closable: true } });
    cy.get('.sd-alert-close-btn').trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('gives the close button a non-empty aria-label', () => {
    cy.mount(Alert, { props: { closable: true } });
    cy.get('.sd-alert-close-btn').should('have.attr', 'aria-label').and('not.equal', '');
  });
});

// 唯一 alert 根元素（多次 setProps 断言时避免引用过期元素）
function sdAlert() {
  return cy.get('.sd-alert');
}
