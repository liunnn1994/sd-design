import manifest from '../../../sd-vue-docs/src/generated/docs-manifest.json';

const interactions: Record<string, (() => void) | undefined> = {
  'switch/basic': () => {
    const control = () => cy.get('[role="switch"]');
    control().should('have.attr', 'aria-checked', 'false');
    control().click().should('have.attr', 'aria-checked', 'true');
    control().click().should('have.attr', 'aria-checked', 'false');
  },
  'checkbox/basic': () => {
    const input = () => cy.get('input[type="checkbox"]');
    input().should('not.be.checked');
    cy.contains('label', '选项 1').click();
    input().should('be.checked');
  },
  'tabs/basic': () => {
    cy.contains('[role="tab"]', '标签页 2').should('have.attr', 'aria-selected', 'true');
    cy.contains('[role="tab"]', '标签页 3').click();
    cy.contains('[role="tab"]', '标签页 3').should('have.attr', 'aria-selected', 'true');
    cy.contains('[role="tabpanel"]', '标签页面板内容 3').should('be.visible');
    cy.contains('[role="tab"]', '标签页 2').should('have.attr', 'aria-selected', 'false');
  },
  'pagination/basic': () => {
    cy.get('[aria-current="page"]').should('have.text', '1');
    cy.contains('.sd-pagination-item', /^2$/).click();
    cy.get('[aria-current="page"]').should('have.text', '2');
  },
  'input-number/basic': () => {
    cy.get('input').first().should('have.value', '15').clear().type('120').blur();
    cy.get('input').first().should('have.value', '100');
    cy.get('input').last().should('be.disabled').and('have.value', '500');
  },
  'transfer/basic': () => {
    const source = '.sd-transfer-view-source .sd-transfer-list-item';
    const target = '.sd-transfer-view-target .sd-transfer-list-item';
    cy.get(target).should('have.length', 3);
    cy.contains(source, '选项 2').find('label').click();
    cy.get('.sd-transfer-operations button').first().click();
    cy.contains(source, '选项 2').should('not.exist');
    cy.contains(target, '选项 2').should('be.visible');
  },
};

describe('all shared documentation scenarios', () => {
  const origin = Cypress.expose('docsOrigin') ?? 'http://127.0.0.1:5188';
  const frameworks = (Cypress.expose('docsFrameworks') ?? 'react,vue').split(',');
  const selectedPages = Cypress.expose('docsPages')?.split('|');
  const selectedPage = Cypress.expose('docsPage');
  const pages = manifest.filter(
    (page) =>
      page.demos.length &&
      (!selectedPages || selectedPages.includes(page.slug)) &&
      (!selectedPage || page.slug === selectedPage),
  );
  if (!pages.length)
    throw new Error(`No documentation scenarios match ${selectedPage ?? selectedPages}`);
  for (const framework of frameworks) {
    for (const page of pages) {
      it(`${framework}: ${page.slug} (${page.demos.length} scenes)`, () => {
        cy.visit(`${origin}/${framework === 'react' ? 'react/' : ''}${page.slug}/`);
        cy.get('.demo-block').should('have.length', page.demos.length);
        for (const id of page.demos) {
          const selector = `.demo-block[data-example="${id}"]`;
          cy.get(selector).scrollIntoView({ duration: 0 });
          cy.get(`${selector} .demo-block__preview-content > astro-island`, { timeout: 60000 })
            .should(($island) =>
              expect($island[0].hasAttribute('ssr'), `${id} hydrated`).to.equal(false),
            )
            .should(($island) =>
              expect($island[0].childNodes.length, `${id} rendered DOM`).to.be.greaterThan(0),
            );
          cy.get(selector).should('not.have.attr', 'data-deferred');
          cy.get(`${selector} .demo-editor__button`).should('exist');
          const interact = interactions[id];
          if (interact) cy.get(`${selector} .demo-block__preview-content`).within(interact);
        }
      });
    }
  }
});
