import { h } from 'vue';

import PageHeader from '../index';

describe('PageHeader', () => {
  it('should emit back event', () => {
    cy.mount(PageHeader, { props: { title: 'SD Design' } });
    cy.get('.sd-page-header-back-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('back')).to.have.length(1);
    });
  });

  it('exposes the back control as a keyboard-accessible button with a name', () => {
    cy.mount(PageHeader, { props: { title: 'Detail' } });
    cy.get('.sd-page-header-back-btn').as('back');
    cy.get('@back').should('have.attr', 'role', 'button');
    cy.get('@back').should('have.attr', 'tabindex', '0');
    cy.get('@back').should('have.attr', 'aria-label', '返回');
    cy.get('@back').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('back'), 'back emitted on Enter').to.have.length(1);
    });
  });

  it('renders title and subtitle props with a divider between them', () => {
    cy.mount(PageHeader, { props: { title: '订单详情', subtitle: '共 3 笔交易' } });
    cy.get('.sd-page-header-title').should('have.text', '订单详情');
    cy.get('.sd-page-header-divider').should('exist');
    cy.get('.sd-page-header-subtitle').should('have.text', '共 3 笔交易');
  });

  it('omits the divider and subtitle when no subtitle is provided', () => {
    cy.mount(PageHeader, { props: { title: '概览' } });
    cy.get('.sd-page-header-divider').should('not.exist');
    cy.get('.sd-page-header-subtitle').should('not.exist');
  });

  it('prefers title and subtitle slots over the corresponding props', () => {
    cy.mount(PageHeader, {
      props: { title: 'Prop Title', subtitle: 'Prop Subtitle' },
      slots: {
        title: () => h('h1', 'Slot Title'),
        subtitle: () => h('span', 'Slot Subtitle'),
      },
    });
    cy.get('.sd-page-header-title')
      .should('contain.text', 'Slot Title')
      .and('not.contain.text', 'Prop Title');
    cy.get('.sd-page-header-subtitle')
      .should('contain.text', 'Slot Subtitle')
      .and('not.contain.text', 'Prop Subtitle');
  });

  it('renders the breadcrumb slot and applies the with-breadcrumb modifier', () => {
    cy.mount(PageHeader, {
      props: { title: '列表' },
      slots: { breadcrumb: () => h('nav', '首页 / 详情') },
    });
    cy.get('.sd-page-header-breadcrumb').should('contain.text', '首页 / 详情');
    cy.get('.sd-page-header-with-breadcrumb').should('exist');
  });

  it('renders extra and default slots as extra and content regions', () => {
    cy.mount(PageHeader, {
      props: { title: '列表' },
      slots: {
        extra: () => h('button', { type: 'button' }, '新增'),
        default: () => h('p', '页面主体内容'),
      },
    });
    cy.get('.sd-page-header-extra').should('contain.text', '新增');
    cy.get('.sd-page-header-content').should('contain.text', '页面主体内容');
    cy.get('.sd-page-header-with-content').should('exist');
  });

  it('hides the back button when showBack is false', () => {
    cy.mount(PageHeader, { props: { title: '详情', showBack: false } });
    cy.get('.sd-page-header-back-btn').should('not.exist');
  });

  it('emits back on Space but not on non-activation keys', () => {
    cy.mount(PageHeader, { props: { title: '详情' } });
    cy.get('.sd-page-header-back-btn').trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('back')).to.have.length(1);
    });
    cy.get('.sd-page-header-back-btn').trigger('keydown', { key: 'ArrowDown' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('back')).to.have.length(1);
    });
  });

  it('renders a custom icon through the back-icon slot', () => {
    cy.mount(PageHeader, {
      props: { title: '详情' },
      slots: { 'back-icon': () => h('i', { class: 'custom-back-icon' }, '回') },
    });
    cy.get('.sd-page-header-back-btn .custom-back-icon').should('contain.text', '回');
  });
});
