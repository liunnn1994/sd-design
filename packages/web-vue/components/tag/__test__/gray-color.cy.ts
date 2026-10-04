import Tag from '../index';

describe('Tag gray theme colors', () => {
  it('applies gray text, background, border and icon tokens', () => {
    cy.mount(Tag, {
      props: { color: 'gray', bordered: true, closable: true },
      slots: { default: 'Gray' },
      attrs: {
        style: [
          '--component-tag-tag-gray-color-text: rgb(12, 34, 56)',
          '--component-tag-tag-gray-color-bg: rgb(78, 90, 123)',
          '--component-tag-tag-gray-bordered-color-border: rgb(45, 67, 89)',
          '--component-tag-tag-gray-color-icon: rgb(23, 45, 67)',
        ].join(';'),
      },
    });
    cy.get('.sd-tag')
      .should('have.css', 'color', 'rgb(12, 34, 56)')
      .and('have.css', 'background-color', 'rgb(78, 90, 123)')
      .and('have.css', 'border-top-color', 'rgb(45, 67, 89)');
    cy.get('.sd-tag-close-btn').should('have.css', 'color', 'rgb(23, 45, 67)');
  });
});
