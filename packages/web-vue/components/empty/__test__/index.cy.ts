import { h } from 'vue';

import { configProviderInjectionKey } from '../../config-provider/context';
import Empty from '../index';

describe('Empty', () => {
  it('renders the description and forwards attributes', () => {
    cy.mount(Empty, {
      props: {
        description: 'No data',
      },
      attrs: {
        'data-testid': 'empty',
      },
    });

    cy.get('[data-testid="empty"]').should('have.class', 'sd-empty');
    cy.get('.sd-empty-description').should('have.text', 'No data');
  });

  it('uses the ConfigProvider empty slot when no local image or description is set', () => {
    cy.mount(Empty, {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {
              empty: ({ component }: { component: string }) =>
                h('div', { 'data-component': component }, 'Custom empty'),
            },
          },
        },
      },
    });

    cy.contains('[data-component="empty"]', 'Custom empty').should('exist');
    cy.get('.sd-empty').should('not.exist');
  });

  it('renders the localized default description when no description or slot is given', () => {
    cy.mount(Empty);

    cy.get('.sd-empty-description').should('have.text', '暂无数据');
  });

  it('renders the default empty icon', () => {
    cy.mount(Empty);

    cy.get('.sd-empty-image svg.sd-icon-empty').should('exist');
  });

  it('default slot should override the description prop', () => {
    cy.mount(Empty, {
      props: {
        description: 'No data',
      },
      slots: {
        default: '<span class="custom-description">Nothing here</span>',
      },
    });

    cy.get('.sd-empty-description .custom-description').should('have.text', 'Nothing here');
    cy.get('.sd-empty-description').should('not.contain.text', 'No data');
  });

  it('image slot should replace the default icon', () => {
    cy.mount(Empty, {
      slots: {
        image: '<img class="custom-image" alt="custom" />',
      },
    });

    cy.get('.sd-empty-image .custom-image').should('exist');
    cy.get('.sd-empty-image svg.sd-icon-empty').should('not.exist');
  });

  it('imgSrc should render an img with the given src and the description as alt', () => {
    const src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

    cy.mount(Empty, {
      props: {
        imgSrc: src,
        description: 'No data',
      },
    });

    cy.get('.sd-empty-image img')
      .should('have.attr', 'src', src)
      .should('have.attr', 'alt', 'No data');
  });

  it('imgSrc alt should fall back to "empty" without a description', () => {
    const src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

    cy.mount(Empty, {
      props: {
        imgSrc: src,
      },
    });

    cy.get('.sd-empty-image img').should('have.attr', 'alt', 'empty');
  });

  // 已知限制：ConfigProvider 自定义 empty 分支把 $attrs 作为 props 传给插槽函数，
  // 插槽模板未消费即丢弃——需 API 层面决策（包装元素或文档声明），暂不透传。
  // 回归记录见 TEST-AUDIT-FINDINGS.md「empty」条目。
  it('inConfigProvider should render the default markup even when a custom empty slot is configured', () => {
    cy.mount(Empty, {
      props: {
        inConfigProvider: true,
      },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {
              empty: () => h('div', { 'data-component': 'empty' }, 'Custom empty'),
            },
          },
        },
      },
    });

    cy.get('.sd-empty').should('exist');
    cy.contains('[data-component="empty"]', 'Custom empty').should('not.exist');
  });

  it('ignores the ConfigProvider empty slot when a local description is set', () => {
    cy.mount(Empty, {
      props: {
        description: 'No data',
      },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {
              empty: () => h('div', { 'data-component': 'empty' }, 'Custom empty'),
            },
          },
        },
      },
    });

    cy.get('.sd-empty').should('exist');
    cy.get('.sd-empty-description').should('have.text', 'No data');
    cy.contains('[data-component="empty"]', 'Custom empty').should('not.exist');
  });

  it('ignores the ConfigProvider empty slot when a local image slot is set', () => {
    cy.mount(Empty, {
      slots: {
        image: '<img class="custom-image" alt="custom" />',
      },
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {
              empty: () => h('div', { 'data-component': 'empty' }, 'Custom empty'),
            },
          },
        },
      },
    });

    cy.get('.sd-empty').should('exist');
    cy.get('.sd-empty-image .custom-image').should('exist');
    cy.contains('[data-component="empty"]', 'Custom empty').should('not.exist');
  });
});
