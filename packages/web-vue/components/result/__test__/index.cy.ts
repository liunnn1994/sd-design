import Result from '../index';

describe('Result', () => {
  const STATUS_ICONS = [
    ['info', 'sd-icon-info'],
    ['success', 'sd-icon-check'],
    ['warning', 'sd-icon-exclamation'],
    ['error', 'sd-icon-close'],
  ] as const;

  it('renders the matching default icon for each named status', () => {
    for (const [status, iconClass] of STATUS_ICONS) {
      cy.mount(Result, { props: { status } });
      cy.get(`.sd-result-icon-${status}`).find(`svg.${iconClass}`).should('exist');
    }
  });

  it('renders inline svg illustrations for the 403, 404 and 500 statuses', () => {
    for (const status of ['403', '404', '500']) {
      cy.mount(Result, { props: { status } });
      cy.get(`.sd-result-icon-${status} svg`).should('exist');
    }
  });

  it('defaults to the info status when no status is provided', () => {
    cy.mount(Result);
    cy.get('.sd-result-icon-info').should('exist');
  });

  it('renders the custom icon class without a default icon for a null status', () => {
    cy.mount(Result, { props: { status: null } });
    cy.get('.sd-result-icon-custom').should('exist');
    cy.get('.sd-result-icon svg').should('not.exist');
  });

  it('renders title and subtitle props and omits the wrappers when neither is provided', () => {
    cy.mount(Result, {
      props: {
        title: '操作成功',
        subtitle: '详情已提交',
      },
    });
    cy.get('.sd-result-title').should('have.text', '操作成功');
    cy.get('.sd-result-subtitle').should('have.text', '详情已提交');

    cy.mount(Result);
    cy.get('.sd-result-title').should('not.exist');
    cy.get('.sd-result-subtitle').should('not.exist');
  });

  it('renders the title and subtitle slots in place of the props', () => {
    cy.mount(Result, {
      props: {
        title: '默认标题',
        subtitle: '默认副标题',
      },
      slots: {
        title: '<span class="custom-title">自定义标题</span>',
        subtitle: '<span class="custom-subtitle">自定义副标题</span>',
      },
    });
    cy.get('.sd-result-title .custom-title').should('have.text', '自定义标题');
    cy.get('.sd-result-subtitle .custom-subtitle').should('have.text', '自定义副标题');
  });

  it('renders the icon slot in place of the default status icon', () => {
    cy.mount(Result, {
      props: { status: 'success' },
      slots: {
        icon: '<div class="custom-icon">自定义图标</div>',
      },
    });
    cy.get('.sd-result-icon .custom-icon').should('exist');
    cy.get('.sd-result-icon svg').should('not.exist');
  });

  it('renders the extra and default slots with their wrappers and omits the wrappers otherwise', () => {
    cy.mount(Result, {
      slots: {
        extra: '<button class="custom-extra">返回首页</button>',
        default: '<p class="custom-content">补充内容</p>',
      },
    });
    cy.get('.sd-result-extra .custom-extra').should('exist');
    cy.get('.sd-result-content .custom-content').should('exist');

    cy.mount(Result);
    cy.get('.sd-result-extra').should('not.exist');
    cy.get('.sd-result-content').should('not.exist');
  });

  it('keeps the icon container decorative with aria-hidden', () => {
    cy.mount(Result, { props: { status: 'error' } });
    cy.get('.sd-result-icon').should('have.attr', 'aria-hidden', 'true');
  });
});
