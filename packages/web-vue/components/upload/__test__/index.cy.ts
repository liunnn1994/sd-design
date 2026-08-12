import Upload from '../index';

describe('Upload', () => {
  it('renders transition list items with an element root', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'warn').as('consoleWarn');
    });
    cy.mount(Upload, {
      props: {
        listType: 'picture-card',
        defaultFileList: [
          { uid: '1', name: 'done.png', status: 'done', url: 'data:image/svg+xml,%3Csvg/%3E' },
          { uid: '2', name: 'failed.png', status: 'error' },
        ],
      },
    });
    cy.get('.sd-upload-list-picture').should('have.length', 2);
    cy.get('@consoleWarn').should((consoleWarn) => {
      expect(consoleWarn).not.to.have.been.calledWithMatch(
        Cypress.sinon.match('Component inside <Transition> renders non-element root node'),
      );
    });
  });

  it('renders the default upload button when no upload-button slot is provided', () => {
    cy.mount(Upload);

    cy.get('.sd-upload button').should('contain.text', '点击上传');
  });

  it('forwards root attributes without leaking the reusable-template binding', () => {
    cy.mount(Upload, {
      props: {
        showFileList: false,
        class: 'avatar-upload',
      },
      slots: {
        'upload-button': '<div class="custom-upload-button">Upload</div>',
      },
    });

    cy.get('.sd-upload').should('have.class', 'avatar-upload');
    cy.get('.sd-upload').should('not.have.attr', 'root-attrs');
    cy.get('.sd-upload .custom-upload-button').should('be.visible');
  });

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
