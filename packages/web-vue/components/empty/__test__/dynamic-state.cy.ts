import { defineComponent, h, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import Empty from '../index';

describe('Empty dynamic state', () => {
  it('prefers a local description slot and restores the provider fallback when removed', () => {
    const local = ref(true);
    const onRetry = cy.spy().as('retry');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ConfigProvider,
            {},
            {
              empty: () => h('span', { class: 'global-empty' }, 'Global empty'),
              default: () =>
                h(
                  Empty,
                  { 'data-testid': 'empty', 'class': 'custom-empty' },
                  local.value ? { default: () => h('button', { onClick: onRetry }, 'Retry') } : {},
                ),
            },
          ),
      }),
    );
    cy.contains('button', 'Retry').click();
    cy.get('@retry').should('have.been.calledOnce');
    cy.get('.global-empty').should('not.exist');
    cy.then(() => {
      local.value = false;
    });
    cy.get('[data-testid="empty"]')
      .should('have.class', 'custom-empty')
      .and('contain.text', 'Global empty');
    cy.then(() => {
      local.value = true;
    });
    cy.contains('button', 'Retry').should('be.visible');
    cy.get('.global-empty').should('not.exist');
  });

  it('updates image description and returns to the default icon when the source is removed', () => {
    const image =
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>';
    cy.mount(Empty, { props: { imgSrc: image, description: 'Before' } });
    cy.get('.sd-empty-image img').should('have.attr', 'alt', 'Before');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ description: 'After' }));
    cy.get('.sd-empty-image img').should('have.attr', 'alt', 'After');
    cy.get('.sd-empty-description').should('have.text', 'After');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ imgSrc: undefined, description: undefined }),
    );
    cy.get('.sd-empty-image img').should('not.exist');
    cy.get('.sd-icon-empty').should('exist');
    cy.get('.sd-empty-description').should('have.text', '暂无数据');
  });
});
