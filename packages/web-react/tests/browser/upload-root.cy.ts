describe('React Upload root composition', () => {
  it('uploads from the actual input and updates/removes the real list', () => {
    cy.visit('/upload-root.html');
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('body'), fileName: 'file.txt' },
      { force: true },
    );
    cy.get('.sd-upload-list-item-uploading').should('contain.text', 'file.txt');
    cy.get('.sd-upload-hide').should('exist');
    cy.contains('button', 'Complete').click();
    cy.get('.sd-upload-list-item-done').should('exist');
    cy.get('output').should('have.text', 'success:file.txt');
    cy.get('.sd-upload-icon-remove').click();
    cy.get('.sd-upload-list-item').should('not.exist');
    cy.get('.sd-upload-hide').should('not.exist');
  });
  it('submits a waiting file through the public ref', () => {
    cy.visit('/upload-root.html?manual');
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('body'), fileName: 'manual.txt' },
      { force: true },
    );
    cy.get('.sd-upload-list-item-init').should('exist');
    cy.contains('button', 'Submit').click();
    cy.get('.sd-upload-list-item-uploading').should('exist');
  });
  it('opens the shared image preview and reports the original file', () => {
    cy.visit('/upload-root.html?picture');
    cy.get('.sd-upload-list-item-name-text').click();
    cy.get('.sd-image-preview-wrapper').should('be.visible');
    cy.get('.sd-image-preview-img').should('have.attr', 'src').and('include', 'data:image/svg+xml');
    cy.get('output').should('have.text', 'preview:preview.svg');
    cy.get('.sd-image-preview-close-btn').click();
    cy.get('.sd-image-preview-wrapper').should('not.exist');
  });
  for (const end of ['removal', 'server URL'] as const) {
    it(`releases the browser-created thumbnail after ${end}`, () => {
      cy.visit('/upload-root.html?picture&local', {
        onBeforeLoad(win) {
          cy.spy(win.URL, 'revokeObjectURL').as('revokeThumbnail');
        },
      });
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
          fileName: 'local.svg',
          mimeType: 'image/svg+xml',
        },
        { force: true },
      );
      cy.get('.sd-upload-list-item-thumbnail img')
        .should('have.attr', 'src')
        .and('match', /^blob:/)
        .then((url) => {
          if (end === 'removal') {
            cy.get('.sd-upload-icon-remove').click();
            cy.get('.sd-upload-list-item').should('not.exist');
          } else {
            cy.contains('button', 'Complete').click();
            cy.get('.sd-upload-list-item-thumbnail img').should('have.attr', 'src', '/done');
          }
          cy.get('@revokeThumbnail').should('have.been.calledOnceWithExactly', url);
        });
    });
  }

  it('uploads the transformed File and respects asynchronous removal vetoes', () => {
    cy.visit('/upload-root.html?hooks');
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('body'), fileName: 'manual.txt' },
      { force: true },
    );
    cy.get('.sd-upload-list-item-uploading').should('contain.text', 'processed-manual.txt');
    cy.get('output').should('have.text', 'request:processed-manual.txt');
    cy.contains('button', 'Complete').click();
    cy.get('.sd-upload-list-item-done').should('contain.text', 'processed-manual.txt');
    cy.get('.sd-upload-icon-remove').click();
    cy.get('output').should('contain.text', 'remove:false');
    cy.get('.sd-upload-list-item-done').should('exist');
    cy.contains('button', 'Allow removal').click();
    cy.get('.sd-upload-icon-remove').click();
    cy.get('output').should('contain.text', 'remove:true');
    cy.get('.sd-upload-list-item').should('not.exist');
  });
});

describe('React Upload cross-tab locking', () => {
  let peer: Window | undefined;
  let release: (() => void) | undefined;
  let lockName: string;

  beforeEach(() => {
    const key = `test-${crypto.randomUUID()}`;
    lockName = `sd-upload:${key}`;
    cy.visit(`/upload-root.html?lock=${key}`);
    cy.window().then((win) => {
      peer = win.open('about:blank', '_blank') ?? undefined;
      expect(peer, 'second browser tab').not.to.equal(undefined);
    });
  });

  afterEach(() => {
    release?.();
    release = undefined;
    peer?.close();
    peer = undefined;
  });

  const select = () =>
    cy
      .get('input[type="file"]')
      .selectFile(
        { contents: Cypress.Buffer.from('body'), fileName: 'locked.txt' },
        { force: true },
      );

  const expectAvailable = (available: boolean) =>
    cy.then(() =>
      peer!.navigator.locks.request(
        lockName,
        available ? { signal: AbortSignal.timeout(2000) } : { ifAvailable: true },
        (lock) => expect(Boolean(lock)).to.equal(available),
      ),
    );

  it('rejects a lock owned by another tab and retries only after user action', () => {
    cy.then(
      () =>
        new Promise<void>((acquired) => {
          void peer!.navigator.locks.request(
            lockName,
            () =>
              new Promise<void>((resolve) => {
                release = resolve;
                acquired();
              }),
          );
        }),
    );
    select();
    cy.get('.sd-upload-list-item-error').should('contain.text', 'locked.txt');
    cy.get('output').should('have.text', 'error:UPLOAD_LOCK_BUSY');
    cy.then(() => release!());
    expectAvailable(true);
    cy.get('output').should('have.text', 'error:UPLOAD_LOCK_BUSY');
    cy.get('.sd-upload-icon-upload').click();
    cy.get('output').should('have.text', 'error:UPLOAD_LOCK_BUSY|request');
    expectAvailable(false);
    cy.contains('button', 'Complete').click();
    cy.get('.sd-upload-list-item-done').should('exist');
    expectAvailable(true);
  });

  it('releases an active lock on cancel and ignores late success', () => {
    select();
    cy.get('output').should('have.text', 'request');
    expectAvailable(false);
    cy.get('.sd-upload-icon-cancel').click();
    cy.get('.sd-upload-list-item-error').should('exist');
    expectAvailable(true);
    cy.contains('button', 'Complete').click();
    cy.get('output').should('have.text', 'request|abort|error:locked.txt');
    cy.get('.sd-upload-list-item-done').should('not.exist');
  });
});
