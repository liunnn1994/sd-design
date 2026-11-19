describe('shared React Markdown documentation', () => {
  const origin = Cypress.expose('docsOrigin') ?? 'http://127.0.0.1:5188';
  beforeEach(() => cy.visit(origin + '/react/components/markdown-render/'));
  it('renders the shared rich Markdown scene through SD components', () => {
    cy.get('[data-example="markdown-render/basic"]')
      .scrollIntoView()
      .within(() => {
        cy.get('.sd-markdown-render').should('exist');
        cy.contains('h2', '段落与内联格式').should('exist');
        cy.get('.sd-link').should('exist');
        cy.get('.sd-checkbox').should('have.length.at.least', 2);
      });
  });
  it('finishes on the last chunk, disables append and resets without adding undefined', () => {
    cy.get('[data-example="markdown-render/streaming"]')
      .scrollIntoView()
      .within(() => {
        for (let index = 0; index < 6; index++) cy.contains('button', '追加内容').click();
        cy.contains('6/6 · 传输完成').should('exist');
        cy.contains('button', '追加内容').should('be.disabled');
        cy.get('.sd-markdown-render').should('not.contain.text', 'undefined');
        cy.contains('button', '重置').click();
        cy.contains('0/6 · 传输中').should('exist');
        cy.contains('button', '追加内容').should('not.be.disabled');
      });
  });
  it('preserves the matching Vue page', () => {
    const frameworkSwitch = '[role="radiogroup"][aria-label="文档框架"]';
    cy.get(frameworkSwitch).closest('astro-island').should('not.have.attr', 'ssr');
    cy.get(frameworkSwitch).contains('label', 'Vue').click();
    cy.location('pathname').should('eq', '/components/markdown-render/');
  });
});
