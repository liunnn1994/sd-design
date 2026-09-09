import { defineComponent, h } from 'vue';

import ConfigProvider from '../../config-provider';
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

  it('forwards attributes to the ConfigProvider custom empty branch', () => {
    cy.mount(
      defineComponent({
        components: { ConfigProvider, Empty },
        template: `
          <ConfigProvider>
            <template #empty="{ component }">
              <div :data-component="component">Custom empty</div>
            </template>
            <Empty data-testid="empty" class="extra-class" />
          </ConfigProvider>
        `,
      }),
    );

    // 容器 div 承载 attrs，内层为 ConfigProvider 插槽内容
    cy.get('[data-testid="empty"]')
      .should('contain.text', 'Custom empty')
      .find('[data-component="empty"]')
      .should('exist');
    cy.get('[data-testid="empty"]').should('have.class', 'extra-class');
    cy.get('.sd-empty').should('not.exist');
  });
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
