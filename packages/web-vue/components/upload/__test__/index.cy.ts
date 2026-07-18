import Upload from '../index';

describe('Upload', () => {
  it('renders an accessible remove button for a listed file', () => {
    cy.mount(Upload, {
      props: {
        defaultFileList: [
          { uid: '1', name: 'demo.png', status: 'done', url: 'data:image/svg+xml,%3Csvg/%3E' },
        ],
      },
    });
    cy.get('.sd-upload-list-item-operation [role="button"]').should(
      'have.attr',
      'aria-label',
      '移除',
    );
    cy.get('.sd-upload-list-item-operation [role="button"]').should('have.attr', 'tabindex', '0');
  });
});
