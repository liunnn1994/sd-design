describe('shared React RichTextEditor documentation', () => {
  const origin = Cypress.expose('docsOrigin') ?? 'http://127.0.0.1:5188';
  beforeEach(() => cy.visit(origin + '/react/components/rich-text-editor/'));
  it('edits the controlled basic scene and writes its text back', () => {
    cy.get('[data-example="rich-text-editor/basic"]')
      .scrollIntoView()
      .within(() => {
        cy.get('[role="textbox"]').click().type('新内容');
        cy.get('.result').should('contain.text', '新内容');
      });
  });
  it('inserts real React input nodes and serializes Markdown', () => {
    cy.get('[data-example="rich-text-editor/components"]')
      .scrollIntoView()
      .within(() => {
        cy.contains('button', '插入 Input').click();
        cy.get('input[placeholder="请输入关键词"]')
          .should('have.value', '关键词')
          .clear()
          .type('新关键词');
      });
    cy.get('[data-example="rich-text-editor/serialization"]')
      .scrollIntoView()
      .within(() => {
        cy.contains('button', '载入 Markdown').click();
        cy.get('h1').should('have.text', 'Lexical 富文本');
        cy.contains('button', '读取 Markdown').click();
        cy.get('.output').should('contain.text', '# Lexical 富文本');
      });
  });
  it('keeps offscreen scenes deferred until they enter the viewport', () => {
    cy.get('[data-example="rich-text-editor/serialization"]').should('have.attr', 'data-deferred');
    cy.get('[data-example="rich-text-editor/serialization"]')
      .find('[contenteditable="true"]')
      .should('not.exist');
    cy.get('[data-example="rich-text-editor/serialization"]')
      .scrollIntoView()
      .find('[role="textbox"]')
      .should('have.attr', 'contenteditable', 'true');
  });
});
