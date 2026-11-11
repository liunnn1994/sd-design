describe('React Upload real XHR transport', () => {
  const waitForRequest = (remaining = 40): void => {
    cy.request('http://127.0.0.1:5192/state').then((response) => {
      if (response.body.length || remaining === 0) {
        expect(response.body).to.have.length(1);
        return;
      }
      cy.wait(50).then(() => waitForRequest(remaining - 1));
    });
  };
  beforeEach(() => cy.request('http://127.0.0.1:5192/reset'));
  const file = () =>
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('actual upload body'),
        fileName: 'network.txt',
        mimeType: 'text/plain',
      },
      { force: true },
    );
  it('sends multipart fields and headers to the receiver and accepts its JSON response', () => {
    cy.visit('/upload-root.html?real');
    file();
    cy.get('.sd-upload-list-item-done').should('be.visible');
    cy.get('output').should('have.text', 'success:network.txt');
    cy.request('http://127.0.0.1:5192/state')
      .its('body')
      .then((requests) => {
        expect(requests).to.have.length(1);
        expect(requests[0].headers['x-upload-test']).to.equal('react-adapter');
        expect(requests[0].headers['content-type']).to.include('multipart/form-data; boundary=');
        expect(requests[0].body)
          .to.include('name="document"; filename="network.txt"')
          .and.include('name="team"')
          .and.include('engineering')
          .and.include('actual upload body');
      });
  });
  it('reports a real HTTP failure as an error file', () => {
    cy.intercept('POST', 'http://127.0.0.1:5192/error').as('realUploadFailure');
    cy.visit('/upload-root.html?real&error');
    file();
    cy.wait('@realUploadFailure').its('response.statusCode').should('equal', 500);
    cy.get('.sd-upload-list-item-error').should('be.visible');
    cy.get('output').should('have.text', 'error:network.txt');
  });
  it('aborts an in-flight XHR and ignores a later server release', () => {
    cy.visit('/upload-root.html?real&slow');
    file();
    cy.get('.sd-upload-list-item-uploading').should('be.visible');
    waitForRequest();
    cy.get('.sd-upload-icon-cancel').click();
    cy.get('.sd-upload-list-item-error').should('exist');
    cy.request('http://127.0.0.1:5192/release');
    cy.get('output').should('have.text', 'error:network.txt');
    cy.get('.sd-upload-list-item-done').should('not.exist');
  });
});
