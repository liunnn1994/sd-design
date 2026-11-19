import manifest from '../../../sd-vue-docs/src/generated/docs-manifest.json';

// Every documented scene must mount; a file or type check cannot prove hydration.
describe('all shared documentation scenarios', () => {
  const origin = Cypress.expose('docsOrigin') ?? 'http://127.0.0.1:5188';
  const frameworks = (Cypress.expose('docsFrameworks') ?? 'react,vue').split(',');
  const selectedPages = Cypress.expose('docsPages')?.split('|');
  for (const framework of frameworks) {
    for (const page of manifest.filter(
      (page) =>
        page.demos.length &&
        (!selectedPages || selectedPages.includes(page.slug)) &&
        (!Cypress.expose('docsPage') || page.slug === Cypress.expose('docsPage')),
    )) {
      it(`${framework}: ${page.slug} (${page.demos.length} scenes)`, () => {
        cy.visit(`${origin}/${framework === 'react' ? 'react/' : ''}${page.slug}/`);
        cy.get('.demo-block').should('have.length', page.demos.length);
        for (const id of page.demos) {
          const selector = `.demo-block[data-example="${id}"]`;
          cy.get(selector).scrollIntoView({ duration: 0 });
          cy.get(selector).should('not.have.attr', 'data-deferred');
          cy.wait(100, { log: false });
          cy.get(`${selector} .demo-block__preview-content > astro-island`, { timeout: 60000 })
            .should(($island) =>
              expect($island[0].hasAttribute('ssr'), `${id} hydrated`).to.equal(false),
            )
            .should(($island) =>
              expect($island[0].childNodes.length, `${id} rendered DOM`).to.be.greaterThan(0),
            );
          cy.get(`${selector} .demo-editor__button`).should('exist');
        }
      });
    }
  }
});
