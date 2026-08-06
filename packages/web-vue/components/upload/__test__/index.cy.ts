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

  it('supports hiding the start action', () => {
    cy.mount(Upload, {
      props: {
        autoUpload: false,
        defaultFileList: [{ uid: '1', name: 'demo.txt', status: 'init' }],
        showStartButton: false,
      },
    });

    cy.get('.sd-upload-icon-start').should('not.exist');
  });

  it('supports hiding every list action', () => {
    cy.mount(Upload, {
      props: {
        defaultFileList: [
          { uid: '1', name: 'pending.txt', status: 'init' },
          { uid: '2', name: 'failed.txt', status: 'error' },
          { uid: '3', name: 'uploading.txt', status: 'uploading' },
          { uid: '4', name: 'done.txt', status: 'done' },
        ],
        showUploadButton: false,
        showStartButton: false,
        showRetryButton: false,
        showCancelButton: false,
        showRemoveButton: false,
      },
    });

    cy.get('.sd-upload').should('not.exist');
    cy.get('.sd-upload-icon-start').should('not.exist');
    cy.get('.sd-upload-icon-upload').should('not.exist');
    cy.get('.sd-upload-icon-cancel').should('not.exist');
    cy.get('.sd-upload-list-item-operation').should('not.exist');
  });

  it('supports hiding every picture-card action without hiding status indicators', () => {
    cy.mount(Upload, {
      props: {
        listType: 'picture-card',
        defaultFileList: [
          { uid: '1', name: 'pending.png', status: 'init' },
          { uid: '2', name: 'failed.png', status: 'error' },
          { uid: '3', name: 'done.png', status: 'done' },
        ],
        showUploadButton: false,
        showStartButton: false,
        showRetryButton: false,
        showPreviewButton: false,
        showRemoveButton: false,
      },
    });

    cy.get('.sd-upload-icon-start').should('not.exist');
    cy.get('.sd-upload-icon-upload').should('not.exist');
    cy.get('.sd-upload-icon-preview').should('not.exist');
    cy.get('.sd-upload-icon-remove').should('not.exist');
    cy.get('.sd-upload-icon-error').should('exist');
  });
});
