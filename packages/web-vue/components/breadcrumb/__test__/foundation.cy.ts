import { defineComponent, h, reactive } from 'vue';

import Breadcrumb from '../index';

describe('Breadcrumb foundation adapters', () => {
  it('updates cumulative route URLs, collapse limits and in-place route changes', () => {
    const state = reactive({
      maxCount: 2,
      routes: ['Root', 'Two', 'Three', 'Four', 'Five', 'Leaf'].map((label) => ({
        label,
        path: `/${label.toLowerCase()}`,
      })),
    });
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Breadcrumb, {
            routes: state.routes,
            maxCount: state.maxCount,
            customUrl: (paths) => `#!/${paths.join('/')}`,
          }),
      }),
    );
    cy.get('.sd-breadcrumb-item').should('have.length', 3);
    cy.get('.sd-breadcrumb-item').first().find('a').should('have.attr', 'href', '#!/root');
    cy.get('.sd-breadcrumb-item[aria-label="更多面包屑项"]').should('exist');
    cy.then(() => {
      state.maxCount = 0;
      state.routes[0]!.path = '/updated';
    });
    cy.get('.sd-breadcrumb-item').should('have.length', 6);
    cy.get('.sd-breadcrumb-item').first().find('a').should('have.attr', 'href', '#!/updated');
    cy.get('.sd-breadcrumb-item').eq(1).find('a').should('have.attr', 'href', '#!/updated/two');
    cy.get('.sd-breadcrumb-item')
      .last()
      .should('contain.text', 'Leaf')
      .find('a')
      .should('not.exist');
    cy.then(() => {
      state.routes.splice(2, 2);
      state.maxCount = 2;
    });
    cy.get('.sd-breadcrumb-item').should('have.length', 3);
    cy.get('.sd-breadcrumb-item').last().should('contain.text', 'Leaf');
    cy.get('.sd-breadcrumb-item-separator').should('have.length', 2);
  });
});
