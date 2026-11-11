import manifest from '../../../sd-vue-docs/src/generated/docs-manifest.json';

export function checkComponentDocs(component: string) {
  const origin = Cypress.expose('docsOrigin') ?? 'http://127.0.0.1:5188';
  const page = manifest.find((page) => page.slug === 'components/' + component)!;
  cy.visit(origin + '/react/' + page.slug + '/');
  cy.get('.demo-block')
    .should('have.length', page.demos.length)
    .then((blocks) => {
      expect([...blocks].map((block) => block.getAttribute('data-example'))).to.deep.equal(
        page.demos,
      );
    });
  cy.get('.demo-block')
    .first()
    .scrollIntoView()
    .find('.demo-block__preview-content > astro-island')
    .should('not.have.attr', 'ssr');
  cy.get('nav[aria-label="文档框架"]').contains('a', 'Vue').click();
  cy.location('pathname').should('equal', '/' + page.slug + '/');
  cy.get('h1').should('exist');
}
